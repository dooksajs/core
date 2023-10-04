import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

/**
 * @namespace dssUser
 */
export default {
  name: 'dssUser',
  version: 1,
  dependencies: [
    {
      name: 'dssDatabase'
    },
    {
      name: 'dssWebServer'
    }
  ],
  data: {
    algorithm: {
      private: true,
      default: 'aes-256-ctr'
    },
    secret: {
      private: true,
      default: ''
    }
  },
  setup ({ secret }) {
    if (!secret || secret.length < 32) {
      throw new Error('Invalid secret length; secret must be at 32 characters')
    }

    this.secret = secret

    this.$method('dssDatabase/model', {
      name: 'user',
      fields: [
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
      ]
    })

    this.$addRoute('user/register', {
      method: 'post',
      handlers: [(request, response) => {
        this._register(request, response)
      }]
    })

    this.$addRoute('user/login', {
      method: 'post',
      handlers: [(request, response) => {
        this._login(request, response)
      }]
    })

    this.$addRoute('user/register', {
      method: 'delete',
      handlers: [
        (request, response, next) => {
          this.$auth(request, response, next)
        },
        (request, response) => {
          this._delete(request, response)
        }]
    })
  },
  /** @lends dssUser */
  methods: {
    $auth (request, response, next) {
      const token = request.signedCookie(request.cookies.token, this.$getCookieSecret())

      if (!token) {
        throw new Error('Unauthorized')
      }

      jwt.verify(token.value, this.secret, (error, decoded) => {
        if (error) {
          throw new Error('Unauthorized')
        }

        const User = this.$getModel('user')

        User.findByPk(decoded.data.id)
          .then(user => {
            if (!user) {
              throw new Error('Unauthorized')
            }

            request.user = user

            next()
          })
      })
    },
    _delete (request, response) {
      const User = this.$getModel('user')
      const userId = request.user.id

      User.findOne({
        where: {
          id: userId
        },
        force: true
      })
        .then(user => {
          if (user) {
            user.destroy()
              .then(() => response.send('OK'))
              .catch(error => response.code(500).send(error))
          } else {
            response.code(404).send('User not found')
          }
        })
        .catch(error => response.code(500).send(error))
    },
    _login (request, response) {
      const data = request.body

      if (data.password) {
        if (data.password.length < 8 || data.password.length > 72) {
          response.code(400).send(new Error('The length must be between 8 and 72.'))
        }
      } else {
        response.code(400).send(new Error('User registration requires a password'))
      }

      const where = {}

      if (data.email) {
        where.email = data.email
      } else if (data.username) {
        where.username = data.username
      }

      const User = this.$getModel('user')

      User.findOne({ where })
        .then(user => {
          if (!user) {
            response.code(404).send()
          }

          const passwordMatch = bcrypt.compareSync(data.password, user.password)

          if (!passwordMatch) {
            response.code(400).send(new Error('Password is incorrect'))
          }

          const token = this._sign({
            payload: {
              id: user.id
            }
          })

          response.setCookie('token', token, {
            path: '/',
            signed: true
          })

          response.send('OK')
        })
        .catch((error) => response.code(500).send(error))
    },
    _register (request, response) {
      const data = request.body

      if (data.password) {
        if (data.password.length < 8 || data.password.length > 72) {
          response.code(400).send(new Error('The length must be between 8 and 72.'))
        }
        const salt = bcrypt.genSaltSync(10)

        data.password = bcrypt.hashSync(data.password, salt)
      } else {
        response.code(400).send(new Error('User registration requires a password'))
      }

      const User = this.$getModel('user')

      User.create(data)
        .then(() => response.send({ message: 'Successfully registered' }))
        .catch((error) => {
          if (error.constructor.name === 'ValidationError') {
            response.code(400).send(error)
          } else {
            response.code(500).send(error)
          }
        })
    },
    _sign ({ payload, expiresIn = '30d' }) {
      return jwt.sign({
        data: payload
      }, this.secret)
    }
  }
}
