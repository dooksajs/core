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

    this.$method('dssWebServer/route', {
      path: '/user/register',
      method: 'post',
      handler: this._register.bind(this)
    })

    this.$method('dssWebServer/route', {
      path: '/user/login',
      method: 'post',
      handler: this._login.bind(this)
    })

    this.$method('dssWebServer/route', {
      path: '/user/delete',
      method: 'delete',
      handler: this._delete.bind(this)
    })
  },
  /** @lends dssUser */
  methods: {
    auth (request) {
      return new Promise((resolve, reject) => {
        const token = request.unsignCookie(request.cookies.token)

        if (!token.valid) {
          reject(new Error('Unauthorized'))
        }

        jwt.verify(token.value, this.secret, (error, decoded) => {
          if (error) {
            reject(new Error('Unauthorized'))
          }

          const User = this.$getDataValue('dssDatabase/models', { id: 'user' }).item

          User.findByPk(decoded.data.id)
            .then(user => {
              if (!user) {
                reject(new Error('Unauthorized'))
              }

              resolve(user)
            })
        })
      })
    },
    _delete (request, response) {
      this.auth(request.cookies.token)
        .then(userId => {
          const User = this.$getDataValue('dssDatabase/models', { id: 'user' }).item

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
        })
        .catch(error => response.code(401).send(error))
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

      const User = this.$getDataValue('dssDatabase/models', { id: 'user' }).item

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
          console.log(token)
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

      const User = this.$getDataValue('dssDatabase/models', { id: 'user' }).item

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
