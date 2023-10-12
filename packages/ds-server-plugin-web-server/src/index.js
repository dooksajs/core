import express from 'express'
import helmet from 'helmet'
import logger from 'pino-http'
import cookieParser from 'cookie-parser'

/**
 * The req object represents the HTTP request and has properties for the request query string, parameters, body, HTTP headers, and so on.
 * @typedef WebServerRequest - {@link https://expressjs.com/en/4x/api.html#req}
 */

/**
 * The res object represents the HTTP response that an Express app sends when it gets an HTTP request.
 * @typedef WebServerResponse - {@link https://expressjs.com/en/4x/api.html#res}
 */

/**
 * To move on to the next middleware, allowing for stacking and fall-backs.
 * @typedef WebServerNext
 */

/**
 * This callback part of a express js routing callback list
 * @callback WebServerHandler
 * @param {WebServerRequest} req
 * @param {WebServerResponse} res
 * @param {WebServerNext} next
 */

/**
 * Dooksa webserver.
 * @namespace dsWebServer
 */
export default {
  name: 'dsWebServer',
  version: 1,
  dependencies: [
    {
      name: 'dsMiddleware'
    }
  ],
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
    this.app.use(express.urlencoded({ extended: true }))
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
    /**
     * Add a route to the server
     * @param {string} path - path
     * @param {Object} route
     * @param {string[]} route.middleware - List of middleware reference Ids
     * @param {string} route.method - HTTP method
     * @param {WebServerHandler[]} route.handlers - List of callbacks
     */
    $setWebServerRoute (path = '/', {
      method = 'get',
      middleware = [],
      handlers = []
    }) {
      if (!this.routeTypes[method]) {
        return
      }

      // add middleware handlers in order
      for (let i = middleware.length - 1; i > -1; i--) {
        const item = middleware[i]
        let id, options

        if (Array.isArray(item)) {
          id = item[0]
          options = item[1]
        } else {
          id = item
        }

        const data = this.$getDataValue('dsMiddleware/items', { id })

        if (!data.isEmpty) {
          let handler = data.item

          if (options) {
            handler = data.item(options)
          }

          handlers.unshift(handler)
        } else {
          throw new Error('Middleware not found: ' + id)
        }
      }

      // add forward slash
      if (path[0] !== '/') {
        path = '/' + path
      }

      this.router[method](path, ...handlers)
    },
    /**
     * Start the web server
     * @param {number} port - Port number for webserver
     */
    start (port = 3000) {
      this.app.listen(port, () => {
        console.log('Listening on port: ' + port)
      })
    }
  }
}
