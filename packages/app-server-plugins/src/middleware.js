import createPlugin from '@dooksa/create-plugin'

/**
 * @typedef {Function} Middleware
 * @param {Object} request
 * @param {Object} response
 * @param {Function} [next]
 */

const handlers = {
  'request/checkBody' (request, response, next) {
    if (Object.getPrototypeOf(request.body) !== Object.prototype || !Object.keys(request.body).length) {
      return response.status(400).send({
        message: 'Missing data'
      })
    }

    next()
  },
  'request/queryIsArray' (request, response, next) {
    const query = request.query.id

    if (!Array.isArray(query)) {
      if (query) {
        request.query.id = [query]
      } else {
        return response.status(400).send({
          details: {
            message: 'Query is undefined'
          },
          name: 'noQuery'
        })
      }
    }

    next()
  }
}

const middleware = createPlugin({
  name: 'middleware',
  actions: {
    /**
     * Get middleware
     * @param {string} name
     * @returns {Middleware}
     */
    get (name) {
      const handler = handlers[name]

      if (!handler) {
        throw new Error('Middleware not found: ' + name)
      }

      return handler
    },
    /**
     * Set middleware
     * @template {function} T
     * @param {Object} param
     * @param {string} param.name - Name of middleware
     * @param {T} param.handler - Express middleware
     */
    set ({ name, handler }) {
      handlers[name] = handler
    }
  }
})

const middlewareGet = middleware.actions.get
const middlewareSet = middleware.actions.set

export { middlewareGet, middlewareSet }

export default middleware
