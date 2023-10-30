import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

/**
 * @namespace dsUser
 */
export default {
  name: 'dsUser',
  version: 1,
  dependencies: [{
    name: 'dsWebServer'
  }],
  data: {
    emails: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'string',
          relation: 'dsUser/items'
        }
      }
    },
    items: {
      default: {},
      schema: {
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
    tokenAlgorithm: {
      private: true,
      default: 'HS256'
    },
    cookieSecret: {
      private: true,
      default: ''
    },
    saltRounds: {
      private: true,
      default: 10
    },
    cookieMaxAge: {
      private: true,
      default: 43200
    }
  },
  setup ({ secret, saltRounds, tokenAlgorithm }) {
    if (typeof secret !== 'string' || secret.length < 32) {
      throw new Error('Invalid secret length; secret must be at 32 characters')
    }

    this.$seedDatabase('ds-user-items')
    this.$seedDatabase('ds-user-emails')

    this.secret = secret

    if (typeof saltRounds === 'number') {
      this.saltRounds = saltRounds
    }

    if (tokenAlgorithm) {
      this.tokenAlgorithm = tokenAlgorithm
    }

    // add middleware
    this.$setDataValue('dsMiddleware/items', this._auth.bind(this), {
      id: 'dsUser/auth'
    })

    // add routes
    this.$setWebServerRoute('/user/register', {
      method: 'post',
      handlers: [
        this._checkPassword.bind(this),
        this._create.bind(this)
      ]
    })

    this.$setWebServerRoute('/user/login', {
      method: 'post',
      handlers: [
        this._checkPassword.bind(this),
        this._login.bind(this)]
    })

    this.$setWebServerRoute('/user/delete', {
      method: 'delete',
      handlers: [this.$deleteDatabaseValue(['dsUser/items'])]
    })
  },
  /** @lends dsUser */
  methods: {
    /**
     * Authenticate user by JWT token middleware
     * @private
     * @param {ExpressRequest} request
     * @param {ExpressResponse} response
     * @param {ExpressNext} next
     */
    _auth (request, response, next) {
      const token = request.signedCookies.token

      if (!token) {
        return response.status(403).send('Unauthorized')
      }

      jwt.verify(token, this.secret, (error, decoded) => {
        if (error) {
          return response.status(403).send(error)
        }

        request.user = { id: decoded.data.id }

        next()
      })
    },
    /**
     * Validate password
     * @private
     * @param {ExpressRequest} request
     * @param {ExpressResponse} response
     */
    _checkPassword (request, response, next) {
      const { password } = request.body

      if (password) {
        if (password.length < 8 || password.length > 72) {
          return response.status(400).send({
            status: 400,
            message: 'The length must be between 8 and 72.'
          })
        }
      } else {
        return response.status(400).send({
          status: 400,
          message: 'User registration requires a password'
        })
      }

      next()
    },
    /**
     * Create new user
     * @private
     * @param {ExpressRequest} request
     * @param {ExpressResponse} response
     */
    _create (request, response) {
      bcrypt.hash(request.body.password, this.saltRounds, (err, hash) => {
        if (err) {
          return response.status(500).send(err)
        }

        // TODO: update snapshot
        const email = this.$getDataValue('dsUser/emails', { id: request.body.email })

        if (!email.isEmpty) {
          return response.status(400).send({ message: 'Email must be unique' })
        }

        const id = this.$method('dsData/generateId')
        const setEmail = this.$setDataValue('dsUser/emails', {
          source: id,
          options: { id: request.body.email }
        })

        if (!setEmail.isValid) {
          return response.status(400).send(setEmail.error.details)
        }

        const setUser = this.$setDataValue('dsUser/items', {
          source: {
            password: hash,
            verified: false
          },
          options: { id }
        })

        if (!setUser.isValid) {
          return response.status(400).send(setUser.error.details)
        }

        // Save user collections
        const saveItems = this.$setDatabaseCollection('dsUser/items')
        const saveEmails = this.$setDatabaseCollection('dsUser/emails')

        Promise.all([saveItems, saveEmails])
          .then(() => {
            response.status(201).send({ message: 'Successfully registered' })
          })
          .catch(error => {
            response.status(500).send(error)
          })
      })
    },
    /**
     * Login using email and password
     * @private
     * @param {ExpressRequest} request
     * @param {ExpressResponse} response
     */
    _login (request, response) {
      const data = request.body
      // const where = {}

      // TODO add username to manage auth without email
      // if (data.email) {
      //   where.email = data.email
      // } else if (data.username) {
      //   where.username = data.username
      // }

      const userId = this.$getDataValue('dsUser/emails', { id: data.email })

      if (userId.isEmpty) {
        return response.status(404).send({
          message: 'No user found'
        })
      }

      const user = this.$getDataValue('dsUser/items', { id: userId.item })
      const passwordMatch = bcrypt.compareSync(data.password, user.item.password)

      if (!passwordMatch) {
        return response.status(400).send({
          message: 'Password is incorrect'
        })
      }

      const token = this._sign({
        payload: {
          id: userId.item
        },
        expiresIn: data.expiresIn || this.cookieMaxAge
      })

      response.cookie('token', token, {
        signed: true,
        httpOnly: true,
        maxAge: data.maxAge || this.cookieMaxAge
      })

      response.send('OK')
    },
    /**
     * JWT sign data
     * @private
     * @param {Object} param
     * @param {*} param.payload - Data to encrypt
     * @param {number} param.maxAge - Cookie max expire age
     * @returns {string}
     */
    _sign ({ payload, expiresIn }) {
      return jwt.sign({
        data: payload
      }, this.secret, { algorithm: this.tokenAlgorithm, expiresIn })
    }
  }
}
