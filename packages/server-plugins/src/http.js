import { createPlugin } from '@dooksa/create'
import { $setDataValue, dataGenerateId } from '@dooksa/plugins'
import { middlewareGet, middlewareSet } from './middleware.js'
import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import compression from 'compression'

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
const routes = {
  all: []
}
let apiPrefix = ''
let cookieSecret = ''
let app
let server

const $http = createPlugin({
  name: 'http',
  data: {
    status: {
      type: 'string'
    }
  },
  actions: {
    /**
     * Add a route to the server
     * @param {string} path - path
     * @param {Object} route
     * @param {string[]} [route.middleware] - List of middleware reference Ids
     * @param {'get'|'post'|'put'|'delete'} [route.method='get'] - HTTP method
     * @param {string} [route.suffix] - Path suffix
     * @param {Middleware[]} route.handlers - List of callbacks
     */
    $setRoute (path = '/', {
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

        $setDataValue('http/status', 'start')
      })
    },
    stop () {
      server.close()

      $setDataValue('http/status', 'stop')
    }
  },
  setup ({
    cookieSecret = '',
    api = '/_',
    publicPath,
    webServerLogger
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

    app = express()
    cookieSecret = cookieSecret

    let secure = true

    if (process.env.NODE_ENV === 'development') {
      secure = false
    } else {
      app.use(compression())
    }

    // setup plugins
    app.use(helmet())
    app.use(cookieParser(cookieSecret, {
      // @ts-ignore
      httpOnly: true,
      sameSite: true,
      secure
    }))

    middlewareSet({
      name: 'request/json',
      handler: express.json
    })

    middlewareSet({
      name: 'request/urlencoded',
      handler: express.urlencoded({ extended: false })
    })

    if (webServerLogger) {
      app.use(webServerLogger)
    }

    if (publicPath) {
      app.use(express.static(publicPath))
    }
  }
})

const httpStart = $http.actions.start
const httpStop = $http.actions.stop
const $setRoute = $http.actions.$setRoute

export {
  httpStart,
  httpStop,
  $setRoute
}

export default $http
