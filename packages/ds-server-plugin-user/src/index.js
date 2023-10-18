import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

/**
 * @namespace dsUser
 */
export default {
  name: 'dsUser',
  version: 1,
  data: {
    emails: {
      private: true,
      default: {}
    },
    users: {
      private: true,
      default: {}
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
      default: 9000000
    }
  },
  setup ({ secret, saltRounds, tokenAlgorithm }) {
    if (typeof secret !== 'string' || secret.length < 32) {
      throw new Error('Invalid secret length; secret must be at 32 characters')
    }

    this.secret = secret

    if (typeof saltRounds === 'number') {
      this.saltRounds = saltRounds
    }

    if (tokenAlgorithm) {
      this.tokenAlgorithm = tokenAlgorithm
    }

    // add middleware
    this.$setDataValue('dsMiddleware/items', {
      source: this._auth.bind(this),
      options: {
        id: 'dsUser/auth'
      }
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
      handlers: [this._delete.bind(this)]
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

        const user = { id: decoded.data.id }

        if (!user) {
          return response.status(404).send('Unauthorized')
        }

        request.user = user

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

        const id = this.$method('dsData/generateId')

        // TODO: update snapshot
        if (this.emails[request.body.email]) {
          return response.status(400).send({ message: 'Email must be unique' })
        }

        this.emails[request.body.email] = id
        this.users[id] = {
          password: hash,
          verified: false
        }

        response.status(201).send({ message: 'Successfully registered' })
      })
    },
    /**
     * Delete user from database
     * @private
     * @param {ExpressRequest} request
     * @param {ExpressResponse} response
     */
    _delete (request, response) {
      delete this.users[request.user.id]
      delete this.emails[request.user.id]

      // TODO: update snapshot
      response.send('OK')
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

      const userId = this.emails[data.email]
      const user = this.users[userId]

      if (!user) {
        return response.status(404).send({
          message: 'No user found'
        })
      }

      const passwordMatch = bcrypt.compareSync(data.password, user.password)

      if (!passwordMatch) {
        return response.status(400).send({
          message: 'Password is incorrect'
        })
      }

      const token = this._sign({
        payload: {
          id: userId
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
