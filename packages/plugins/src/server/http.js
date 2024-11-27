import createPlugin from '@dooksa/create-plugin'
import { dataAddListener, dataSetValue } from '../client/index.js'
import { middlewareGet, middlewareSet } from './middleware.js'
import helmet from 'helmet'
import compression from 'compression'
import HyperExpress from 'hyper-express'
import LiveDirectory from 'live-directory'

/**
 * @import {Middleware} from './middleware.js'
 */

const routeTypes = {
  get: true,
  post: true,
  put: true,
  delete: true
}
const routes = { all: [] }
let apiPrefix = ''
let cookieSecret = ''

export const $http = createPlugin('http', {
  models: {
    status: { type: 'string' }
  },
  data: {
    app: () => ({})
  },
  methods: {
    useRoutes () {
      const apiRoutes = routes[apiPrefix]

      for (let i = 0; i < apiRoutes.length; i++) {
        const route = apiRoutes[i]

        this.app[route.method](route.path, ...route.handlers)
      }

      for (let index = 0; index < routes.all.length; index++) {
        const route = routes.all[index]

        this.app[route.method](route.path, ...route.handlers)
      }
    },
    /**
     * Create server
     * @param {Object} options
     * @param {Object} [options.assets]
     * @param {string} options.assets.directory - Local asset directory
     * @param {string} options.assets.path - Public path name to assets
     * @param {string[]} [options.assets.extensions] - Allowed file extensions
     */
    init ({ assets } = {}) {
      this.app = new HyperExpress.Server()

      if (process.env.NODE_ENV === 'production') {
        // @ts-ignore
        this.app.use(compression())
        // @ts-ignore
        this.app.use(helmet())
      }

      /** {@link https://github.com/kartikk221/hyper-express/blob/master/docs/LiveDirectory.md} */
      if (assets) {
        const extensions = assets.extensions ?? ['css', 'ico', 'png', 'jpg', 'jpeg']

        // Create a LiveDirectory instance to virtualize directory with our assets
        // Specify the "path" of the directory we want to consume using this instance as the first argument
        const LiveAssets = new LiveDirectory(assets.directory, {
          // Optional: Configure filters to ignore or include certain files, names, extensions etc etc.
          filter: {
            keep: { extensions },
            ignore: (path) => {
              // You can define a function to perform any kind of matching on the path of each file being considered by LiveDirectory
              // For example, the below is a simple dot-file ignore match which will prevent any files starting with a dot from being loaded into live-directory
              return path.startsWith('.')
            }
          }
        })

        // Create static serve route to serve frontend assets
        this.app.get(assets.path + '/*', (request, response) => {
          // Strip away '/assets' from the request path to get asset relative path
          // Lookup LiveFile instance from our LiveDirectory instance.
          const path = request.path.replace(assets.path, '')
          const file = LiveAssets.get(path)

          // Return a 404 if no asset/file exists on the derived path
          if (file === undefined) return response.status(404).send()

          const fileParts = file.path.split('.')
          const extension = fileParts[fileParts.length - 1]

          // Retrieve the file content and serve it depending on the type of content available for this file
          const content = file.content
          if (content instanceof Buffer) {
            // Set appropriate mime-type and serve file content Buffer as response body (This means that the file content was cached in memory)
            return response.type(extension).send(content)
          } else {
            // Set the type and stream the content as the response body (This means that the file content was NOT cached in memory)
            return response.type(extension).stream(content)
          }
        })
      }
    },
    /**
     * Add a route to the server
     * @param {Object} route
     * @param {string} route.path - path
     * @param {string[]} [route.middleware] - List of middleware reference Ids
     * @param {'get'|'post'|'put'|'delete'} [route.method='get'] - HTTP method
     * @param {string} [route.suffix] - Path suffix
     * @param {Middleware[]} route.handlers - List of callbacks
     */
    setRoute ({
      path = '/',
      method = 'get',
      middleware = [],
      handlers = [],
      suffix = apiPrefix
    }) {
      if (!routeTypes[method]) {
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

      if (suffix !== apiPrefix) {
        suffix = 'all'
      }

      routes[suffix].push({
        method,
        path: suffixPath,
        handlers
      })
    },
    /**
     * Start the web server
     * @param {number} [port=6362] - Port number for webserver @link https://gchq.github.io/CyberChef/#recipe=Fletcher-8_Checksum()To_Hex('None',0)&input=ZG9va3Nh
     * @param {string} [path='http://localhost']
     */
    start (port = 6362, path = 'http://localhost') {
      return new Promise((resolve, reject) => {
        this.useRoutes()

        this.app.listen(port)
          .then(function (socket) {
            resolve({
              hostname: path,
              port: port || this.address().port,
              socket
            })
          })
          .catch(error => reject(error))
      })
    },
    stop () {
      const isClosed = this.app.close()

      if (!isClosed) {
        dataSetValue({
          name: 'http/status',
          value: 'stop-failed'
        })
      }
    }
  },
  setup ({
    cookieSecret = '',
    api = '/_',
    publicPath = ''
  } = {}) {
    DEV: {
      cookieSecret = 'Invalid cookie secret length; secret must be at 32 characters'
    }

    if (!cookieSecret || cookieSecret.length < 32) {
      throw new Error('Invalid cookie secret length; secret must be at 32 characters')
    }

    if (api) {
      apiPrefix = api
    }

    // prepare api route suffix
    routes[apiPrefix] = []
    cookieSecret = cookieSecret

    // initialise server
    this.init(publicPath)

    // handle json requests
    middlewareSet({
      name: 'request/json',
      handler: (request, response, next) => {
        // skip if body exists
        if (typeof request.body === 'object') {
          return next()
        }

        request.json()
          .then(body => {
            request.body = body
            next()
          })
          .catch(error => {
            response.status(500).send(error)
          })
      }
    })

    // handle urlencoded requests
    middlewareSet({
      name: 'request/urlencoded',
      handler: (request, response, next) => {
        // skip if body exists
        if (typeof request.body === 'object') {
          return next()
        }

        request.urlencoded()
          .then(body => {
            request.body = body
            next()
          })
          .catch(error => {
            response.status(500).send(error)
          })
      }
    })

    DEV: {
      dataAddListener({
        name: 'http/status',
        on: 'update',
        handler: (data) => {
          // stop server
          if (data.item === 'stop') {
            this.app.close()
          }
        }
      })
    }
  }
})

export const {
  httpSetRoute,
  httpStart,
  httpStop
} = $http

export default $http
