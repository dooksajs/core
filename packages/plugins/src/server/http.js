import { createPlugin } from '@dooksa/create-plugin'
import { stateSetValue } from '../client/index.js'
import { middlewareGet } from './middleware.js'
import helmet from 'helmet'
import compression from 'compression'
import express from 'express'

/**
 * @import {Request, Response, NextFunction, Handler, Express} from 'express'
 * @import { Server } from 'node:http'
 */

/**
 * @typedef {Object} AssetLocation
 * @property {string} path - Public path name to assets
 * @property {string[]} [extensions] - Allowed file extensions
 * @property {string} directory - Local asset directory
 */

export const $http = createPlugin('http', {
  state: {
    schema: {
      status: { type: 'string' }
    }
  },
  data: {
    /** @type {Server|Null} */
    server: null,
    routes: {
      all: []
    },
    apiPrefix: '',
    cookieSecret: '',
    routeTypes: {
      get: true,
      post: true,
      put: true,
      delete: true
    },
    app: express()
  },
  methods: {
    useRoutes () {
      const apiRoutes = this.routes[this.apiPrefix] || []

      for (let i = 0; i < apiRoutes.length; i++) {
        const route = apiRoutes[i]

        // Register route with express
        this.app[route.method](route.path, ...route.handlers)
      }

      for (let i = 0; i < this.routes.all.length; i++) {
        const route = this.routes.all[i]

        // Register route with express
        this.app[route.method](route.path, ...route.handlers)
      }
    },
    /**
     * Create server
     * @param {Object} options
     * @param {AssetLocation} [options.assets]
     */
    init ({ assets } = {}) {
      if (process.env.NODE_ENV === 'production') {
        this.app.use(compression())
        this.app.use(helmet())
      }

      // handle json requests
      this.app.use(express.json())
      // handle urlencoded requests
      this.app.use(express.urlencoded({ extended: true }))

      /** {@link https://expressjs.com/en/4x/api.html#express.static} */
      if (assets) {
        const extensions = assets.extensions ?? ['css', 'ico', 'png', 'jpg', 'jpeg', 'webp', 'avif']

        // Use express.static to serve static files
        this.app.use(assets.path, express.static(assets.directory, {
          extensions: extensions,
          dotfiles: 'ignore'
        }))
      }
    },
    /**
     * Add a route to the server
     * @param {Object} route
     * @param {string} route.path - path
     * @param {string[]} [route.middleware] - List of middleware reference Ids
     * @param {'get'|'post'|'put'|'delete'} [route.method='get'] - HTTP method
     * @param {string} [route.suffix] - Path suffix
     * @param {Handler[]} route.handlers - List of callbacks
     */
    setRoute ({
      path = '/',
      method = 'get',
      middleware = [],
      handlers = [],
      suffix = this.apiPrefix
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

        let handler = middlewareGet(id)

        if (options) {
          handler = handler(options)
        }

        handlers.unshift(handler)
      }

      const suffixPath = suffix + path

      if (suffix !== this.apiPrefix) {
        suffix = 'all'
      }

      this.routes[suffix].push({
        method,
        path: suffixPath,
        handlers
      })
    },
    /**
     * Start the web server
     * @param {Object} options
     * @param {number} [options.port=6362] - Port number for webserver {@link https://gchq.github.io/CyberChef/#recipe=Fletcher-8_Checksum()To_Hex('None',0)&input=ZG9va3Nh}
     * @param {string} [options.path='http://localhost']
     */
    start ({
      port = 6362,
      path = 'http://localhost'
    } = {}) {
      return new Promise((resolve, reject) => {
        this.useRoutes()

        const server = this.app.listen(port, () => {
          resolve({
            hostname: path,
            port: port,
            socket: server
          })
        })

        server.on('error', reject)

        // set server
        this.server = server
      })
    },
    stop () {
      if (this.server !== null) {
        this.server.close((error) => {
          if (error) {
            stateSetValue({
              name: 'http/status',
              value: 'stop-failed'
            })
          } else {
            stateSetValue({
              name: 'http/status',
              value: 'stopped'
            })

            this.server = null
          }
        })
      } else {
        stateSetValue({
          name: 'http/status',
          value: 'stop-failed'
        })
      }
    }
  },
  /**
   * @param {Object} options
   * @param {string} [options.cookieSecret]
   * @param {string} [options.apiPrefix='/_'] - REST API prefix path
   * @param {AssetLocation} [options.assets]
   */
  setup ({
    cookieSecret = '',
    apiPrefix = '/_',
    assets
  } = {}) {
    DEV: {
      cookieSecret = 'Invalid cookie secret length; secret must be at 32 characters'
    }

    if (!cookieSecret || cookieSecret.length < 32) {
      throw new Error('Invalid cookie secret length; secret must be at 32 characters')
    }

    if (apiPrefix) {
      if (typeof apiPrefix !== 'string') {
        throw new Error('HTTP: invalid api prefix type: "'+ typeof apiPrefix + '"')
      }
      
      this.apiPrefix = apiPrefix
    }

    // prepare api route suffix
    this.routes[this.apiPrefix] = []
    this.cookieSecret = cookieSecret

    // initialise server
    this.init({ assets }) 
  }
})

export const {
  httpSetRoute,
  httpStart,
  httpStop
} = $http

export default $http
