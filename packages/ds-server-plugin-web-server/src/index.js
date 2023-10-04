import express from 'express'
import helmet from 'helmet'
import logger from 'pino-http'
import cookieParser from 'cookie-parser'

/**
 * Dooksa webserver.
 * @namespace dssWebServer
 */
export default {
  name: 'dssWebServer',
  version: 1,
  data: {
    cookieSecret: {
      private: true,
      default: ''
    },
    app: {
      private: true,
      default: () => {}
    },
    routes: {
      private: true,
      default: {}
    },
    routeTypes: {
      private: true,
      default: {
        get: true,
        post: true,
        put: true,
        delete: true
      }
    }
  },
  setup ({ cookieSecret, apiSuffix = '/api' }) {
    if (!cookieSecret || cookieSecret.length < 32) {
      throw new Error('Invalid cookie secret length; secret must be at 32 characters')
    }

    this.app = express()
    this.cookieSecret = cookieSecret

    // setup plugins
    this.app.use(helmet())
    this.app.use(express.json())
    this.app.use(cookieParser(cookieSecret, {
      httpOnly: true,
      sameSite: true,
      secure: !this.isDev
    }))

    if (this.isDev) {
      this.app.use(logger())
    }

    this.router = express.Router()

    this.app.use(apiSuffix, this.router)
  },
  methods: {
    $getCookieSecret: {
      value () {
        return this.cookieParser
      },
      scope: ['dssUser']
    },
    /**
     * Add a route to the server
     * @param {string} path - path
     * @param {Object} options - Extra options
     * @param {string} options.method - HTTP method type
     * @param {Array} options.handlers - List of callbacks
     */
    $addRoute (
      path = '',
      {
        method = 'get',
        handlers = []
      }
    ) {
      if (!this.routeTypes[method]) {
        return
      }

      // add forward slash
      if (path[0] !== '/') {
        path = '/' + path
      }
      
      this.router[method](path, ...handlers)
    },
    start (port = 3000) {
      this.app.listen(port, () => {
        console.log('Listening on port: ' + port)
      })
    }
  }
}
