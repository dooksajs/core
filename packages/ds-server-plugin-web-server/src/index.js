import Fastify from 'fastify'
import cookie from '@fastify/cookie'

/**
 * Dooksa webserver.
 * @namespace dssWebServer
 */
export default {
  name: 'dssWebServer',
  version: 1,
  data: {
    server: {
      private: true,
      default: () => {}
    }
  },
  setup ({ secret }) {
    if (!secret || secret.length < 32) {
      throw new Error('Invalid secret length; secret must be at 32 characters')
    }

    this.server = Fastify({
      logger: {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname'
          }
        }
      }
    })

    this.server.register(cookie, {
      secret,
      httpOnly: true,
      sameSite: true,
      secure: !this.isDev
    })
  },
  methods: {
    route ({ method = 'get', path, handler }) {
      this.server.route({ method, path, handler })
    },
    start (port = 3000) {
      this.server.listen({ port }, (err, address) => {
        if (err) {
          this.server.log.error(err.message)
        }
        // Server is now listening on ${address}
      })
    }
  }
}
