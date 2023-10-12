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
     * @param {Object} route
     * @param {string} route.path - path
     * @param {string} route.method - HTTP method
     * @param {Array} route.handlers - List of callbacks
     */
    addRoute ({
      path = '/',
      method = 'get',
      middleware = [],
      handlers = []
    }) {
      if (!this.routeTypes[method]) {
        return
      }

      // add middleware handlers in order
      for (let i = middleware.length - 1; i > -1; i--) {
        const data = this.$getDataValue('dssWebServer/middleware', { id: middleware[i] })
        
        if (!data.isEmpty) {
          handlers.unshift(data.item)
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
