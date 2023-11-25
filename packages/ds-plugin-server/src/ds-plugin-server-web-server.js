import { definePlugin } from '@dooksa/utils'
import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import compression from 'compression'

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
export default definePlugin({
  name: 'dsWebServer',
  version: 1,
  dependencies: [
    {
      name: 'dsMiddleware'
    }
  ],
  data: {
    apiSuffix: {
      private: true,
      default: () => '/_'
    },
    cookieSecret: {
      private: true,
      schema: {
        type: 'string'
      }
    },
    app: {
      private: true,
      schema: {
        type: 'function'
      }
    },
    routes: {
      private: true,
      default: () => ({
        all: []
      })
    },
    routeTypes: {
      private: true,
      default: () => ({
        get: true,
        post: true,
        put: true,
        delete: true
      })
    }
  },
  setup ({ cookieSecret, apiSuffix, publicPath, webServerLogger }) {
    if (!cookieSecret || cookieSecret.length < 32) {
      throw new Error('Invalid cookie secret length; secret must be at 32 characters')
    }

    if (apiSuffix) {
      this.apiSuffix = apiSuffix
    }

    // prepare api route suffix
    this.routes[this.apiSuffix] = []

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

    if (webServerLogger) {
      this.app.use(webServerLogger)
    }

    if (!this.isDev) {
      this.app.use(compression())
    }

    if (publicPath) {
      this.app.use(express.static(publicPath))
    }
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
      handlers = [],
      suffix = this.apiSuffix
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

      const suffixPath = suffix + path

      if (suffix === this.apiSuffix) {
        this.routes[suffix].push({ method, path: suffixPath, handlers })
        return
      }

      this.routes.all.push({ method, path: suffixPath, handlers })
    },
    /**
     * Start the web server
     * @param {number} port - Port number for webserver @link https://gchq.github.io/CyberChef/#recipe=Fletcher-8_Checksum()To_Hex('None',0)&input=ZG9va3Nh
     */
    start (port = 6362, path = 'http://localhost') {
      this._useRoutes(port, path)

      const log = this.$log

      this.app.listen(port, function () {
        port = port || this.address().port

        log('info', { message: `{magenta.bold Dooksa!} 👉 {cyan.underline ${path + ':' + port}} 👀` })
      })
    },
    _useRoutes (port, path) {
      const apiRoutes = this.routes[this.apiSuffix]

      for (let i = 0; i < apiRoutes.length; i++) {
        const route = apiRoutes[i]

        this.app[route.method](route.path, ...route.handlers)
      }

      for (let index = 0; index < this.routes.all.length; index++) {
        const route = this.routes.all[index]

        this.app[route.method](route.path, ...route.handlers)
      }
    }
  }
})
