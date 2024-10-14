import createPlugin from '@dooksa/create-plugin'
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import jwt from 'jsonwebtoken'
import { databaseDeleteValue, databaseSeed, databaseSetValue } from './database.js'
import { dataGetValue } from '@dooksa/plugins'
import { httpSetRoute } from './http.js'
import { middlewareSet } from './middleware.js'
import { generateId } from '@dooksa/utils'

let cookieMaxAge = 43200
let JWTAlgorithm = 'HS256'
let JWTSecret = ''

const user = createPlugin('user', {
  models: {
    emails: {
      type: 'collection',
      items: {
        type: 'string',
        relation: 'user/items'
      }
    },
    items: {
      type: 'collection',
      items: {
        type: 'object',
        properties: {
          email: {
            type: 'string'
          },
          password: {
            type: 'string'
          },
          verified: {
            type: 'boolean'
          }
        }
      }
    }
  },
  setup ({ secret, algorithm } = {}) {
    DEV: {
      secret = 'Invalid secret length; secret must be at 32 characters'
    }

    if (typeof secret !== 'string' || secret.length < 32) {
      throw new Error('Invalid secret length; secret must be at 32 characters')
    }

    databaseSeed('user-items')
    databaseSeed('user-emails')

    JWTSecret = secret

    if (algorithm) {
      JWTAlgorithm = algorithm
    }

    // add middleware
    middlewareSet({
      name: 'user/auth',
      handler: auth
    })

    // add routes
    httpSetRoute({
      path: '/user/register',
      method: 'post',
      middleware: ['request/json'],
      handlers: [
        checkPassword,
        create
      ]
    })

    httpSetRoute({
      path: '/user/login',
      method: 'post',
      middleware: ['request/json'],
      handlers: [
        checkPassword,
        login
      ]
    })

    httpSetRoute({
      path: '/user/delete',
      method: 'delete',
      handlers: [databaseDeleteValue(['user/items'])]
    })
  }
})

/**
 * Pass the password string and get hashed password back
 * @param {string} password
 * @param {string} salt
 * @returns
 */
function encryptPassword (password, salt) {
  return scryptSync(password, salt, 32)
}

/**
 * Hash password with random salt
 * @param {string} password
 * @return {string} password hash followed by salt
 *  XXXX till 64 XXXX till 32
 *
 */
function hashPassword (password) {
  // Any random string here (ideally should be at least 16 bytes)
  const salt = randomBytes(16).toString('hex')
  return encryptPassword(password, salt).toString('hex') + salt
};

/**
 * Match password against the stored hash
 * @param {string} password
 * @param {string} hash
 */
function matchPassword (password, hash) {
  // extract salt from the hashed string
  // our hex password length is 32*2 = 64
  const salt = hash.slice(64)
  const originalPassHash = Buffer.from(hash.slice(0, 64), 'hex')
  const currentPassHash = encryptPassword(password, salt)

  return timingSafeEqual(originalPassHash, currentPassHash)
};

/**
 * Authenticate user by JWT token middleware
 * @private
 */
function auth (request, response, next) {
  const token = request.signedCookies.token

  if (!token) {
    return response.status(403).send('Unauthorized')
  }

  jwt.verify(token, JWTSecret, (error, decoded) => {
    if (error) {
      return response.status(403).json(error)
    }

    request.userId = decoded.data.id

    next()
  })
}

/**
 * Validate password
 * @private
 */
function checkPassword (request, response, next) {
  const { password } = request.body

  if (password) {
    if (password.length < 8 || password.length > 72) {
      return response.status(400).json({
        status: 400,
        message: 'The length must be between 8 and 72.'
      })
    }
  } else {
    return response.status(400).json({
      status: 400,
      message: 'User registration requires a password'
    })
  }

  next()
}

/**
 * Create new user
 * @private
 */
function create (request, response) {
  const hash = hashPassword(request.body.password)

  // TODO: update snapshot
  const email = dataGetValue({
    name: 'user/emails',
    id: request.body.email
  })

  if (!email.isEmpty) {
    return response.status(400).json({ message: 'Email must be unique' })
  }

  const userId = generateId
  const metadata = { userId }
  const emailItem = {
    collection: 'user/emails',
    id: request.body.email,
    item: userId,
    metadata
  }
  const userItem = {
    collection: 'user/items',
    id: userId,
    item: {
      password: hash,
      verified: false
    },
    metadata
  }

  const setData = databaseSetValue({
    items: [
      emailItem, userItem
    ]
  })

  if (!setData.isValid) {
    if (setData.snapshotError) {
      response.status(500).json(setData.snapshotError)
    }

    return response.status(400).sejsonnd(setData.error.details)
  }

  response.status(201).json({
    message: 'Successfully created account'
  })
}

/**
 * Login using email and password
 * @private
 */
function login (request, response) {
  const data = request.body
  // const where = {}

  // TODO add username to manage auth without email
  // if (data.email) {
  //   where.email = data.email
  // } else if (data.username) {
  //   where.username = data.username
  // }

  const userId = dataGetValue({
    name: 'user/emails',
    id: data.email
  })

  if (userId.isEmpty) {
    return response.status(404).json({
      message: 'No user found'
    })
  }

  const user = dataGetValue({
    name: 'user/items',
    id: userId.item
  })
  const passwordMatch = matchPassword(data.password, user.item.password)

  if (!passwordMatch) {
    return response.status(400).json({
      message: 'Password is incorrect'
    })
  }

  const token = sign({
    payload: {
      id: userId.item
    },
    expiresIn: data.expiresIn || cookieMaxAge
  })

  response.cookie('token', token, {
    signed: true,
    httpOnly: true,
    maxAge: data.maxAge || cookieMaxAge
  })

  response.send('OK')
}

/**
 * JWT sign data
 * @private
 * @param {Object} param
 * @param {*} param.payload - Data to encrypt
 * @param {number} param.expiresIn - Cookie max expire age
 * @returns {string}
 */
function sign ({ payload, expiresIn }) {
  return jwt.sign({
    data: payload
  }, JWTSecret, {
    algorithm: JWTAlgorithm,
    expiresIn
  })
}

export default user
