import { definePlugin } from '@dooksa/ds-scripts'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

/**
 * @namespace dsUser
 */
export default definePlugin({
  name: 'dsUser',
  version: 1,
  dependencies: [{
    name: 'dsWebServer'
  }],
  data: {
    emails: {
      schema: {
        type: 'collection',
        items: {
          type: 'string',
          relation: 'dsUser/items'
        }
      }
    },
    items: {
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
      default: () => 'HS256'
    },
    secret: {
      private: true,
      schema: {
        type: 'string'
      }
    },
    saltRounds: {
      private: true,
      default: () => 10
    },
    cookieMaxAge: {
      private: true,
      default: () => 43200
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
      middleware: ['request/json'],
      handlers: [
        this._checkPassword.bind(this),
        this._create.bind(this)
      ]
    })

    this.$setWebServerRoute('/user/login', {
      method: 'post',
      middleware: ['request/json'],
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

        request.userId = decoded.data.id

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

        const userId = this.$method('dsData/generateId')
        const metadata = { userId }
        const emailItem = {
          collection: 'dsUser/emails',
          id: request.body.email,
          item: userId,
          metadata
        }
        const userItem = {
          collection: 'dsUser/items',
          id: userId,
          item: {
            password: hash,
            verified: false
          },
          metadata
        }

        const setData = this.$setDatabaseValue({
          items: [
            emailItem, userItem
          ]
        })

        if (!setData.isValid) {
          if (setData.snapshotError) {
            response.status(500).send(setData.snapshotError)
          }

          return response.status(400).send(setData.error.details)
        }

        response.status(201).send({
          message: 'Successfully created account'
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
})
