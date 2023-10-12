import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

/**
 * @namespace dsUser
 */
export default {
  name: 'dsUser',
  version: 1,
  data: {
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
      default: 90000
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

    // setup model
    this.$setDatabaseModel('user', [
      {
        name: 'username',
        type: 'string',
        defaultValue: {
          dataType: 'uuidv4'
        },
        options: {
          unique: true
        }
      },
      {
        name: 'email',
        type: 'string',
        options: {
          unique: true,
          validate: {
            isEmail: true
          }
        }
      },
      {
        name: 'password',
        type: 'string',
        options: {
          allowNull: false
        }
      },
      {
        name: 'verified',
        type: 'boolean',
        defaultValue: {
          dataType: 'boolean'
        }
      }
    ])

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
          return response.status(403).send('Unauthorized')
        }

        this.$getDatabaseValue('user', {
          type: 'findByPk',
          options: decoded.data.id
        })
          .then(user => {
            if (!user) {
              return response.status(403).send('Unauthorized')
            }

            request.user = user

            next()
          })
          .catch(error => {
            response.status(500).send(error)
          })
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

        this.$setDatabaseValue('user', {
          source: [{
            email: request.body.email,
            password: hash
          }]
        })
          .then(() => response.status(201).send({ message: 'Successfully registered' }))
          .catch((error) => {
            if (error.constructor.name === 'ValidationError') {
              return response.status(400).send(error)
            }

            response.status(500).send(error)
          })
      })
    },
    /**
     * Delete user from database
     * @private
     * @param {ExpressRequest} request
     * @param {ExpressResponse} response
     */
    _delete (request, response) {
      this.$getDatabaseValue('user', {
        type: 'findByPk',
        options: request.user.id
      })
        .then(user => {
          if (user) {
            user.destroy()
              .then(() => response.send('OK'))
              .catch(error => response.status(500).send(error))
          } else {
            response.status(404).send('User not found')
          }
        })
        .catch(error => response.status(500).send(error))
    },
    /**
     * Login using email and password
     * @private
     * @param {ExpressRequest} request
     * @param {ExpressResponse} response
     */
    _login (request, response) {
      const data = request.body
      const where = {}

      if (data.email) {
        where.email = data.email
      } else if (data.username) {
        where.username = data.username
      }

      this.$getDatabaseValue('user', {
        type: 'findOne',
        options: { where }
      })
        .then(user => {
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
              id: user.id
            },
            expiresIn: data.expiresIn || this.cookieMaxAge
          })

          response.cookie('token', token, {
            signed: true,
            maxAge: data.maxAge || this.cookieMaxAge
          })

          response.send('OK')
        })
        .catch((error) => {
          response.status(500).send({
            message: error.message
          })
        })
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
