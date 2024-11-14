import createPlugin from '@dooksa/create-plugin'
import { dataSetValue } from '@dooksa/plugins'
import { middlewareGet, middlewareSet } from './middleware.js'
import helmet from 'helmet'
import compression from 'compression'
import HyperExpress from 'hyper-express'

/**
 * @typedef {import('./middleware.js').Middleware} Middleware
 */

function useRoutes () {
  const apiRoutes = routes[apiPrefix]

  for (let i = 0; i < apiRoutes.length; i++) {
    const route = apiRoutes[i]

    app[route.method](route.path, ...route.handlers)
  }

  for (let index = 0; index < routes.all.length; index++) {
    const route = routes.all[index]

    app[route.method](route.path, ...route.handlers)
  }
}

const routeTypes = {
  get: true,
  post: true,
  put: true,
  delete: true
}
const routes = { all: [] }
let apiPrefix = ''
let cookieSecret = ''
let app
let server

const $http = createPlugin('http', {
  models: {
    status: { type: 'string' }
  },
  actions: {
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
      useRoutes()

      server = app.listen(port, function () {
        port = port || this.address().port
        console.log('✨ Dooksa! ' + path + ':' + port)

        dataSetValue({
          name: 'http/status',
          value: 'start'
        })
      })
    },
    stop () {
      server.close()

      dataSetValue({
        name: 'http/status',
        value: 'stop'
      })
    }
  },
  setup ({
    cookieSecret = '',
    api = '/_',
    publicPath
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

    app = new HyperExpress.Server()
    cookieSecret = cookieSecret

    if (process.env.NODE_ENV === 'production') {
      // @ts-ignore
      app.use(compression())
      // @ts-ignore
      app.use(helmet())
    }

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

    if (publicPath) {
      /** https://github.com/kartikk221/hyper-express/blob/master/docs/LiveDirectory.md */
      // app.use(express.static(publicPath))
    }
  }
})

const httpStart = $http.actions.start
const httpStop = $http.actions.stop
const httpSetRoute = $http.actions.setRoute

export {
  httpStart,
  httpStop,
  httpSetRoute
}

export default $http
