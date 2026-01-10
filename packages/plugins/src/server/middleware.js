import { createPlugin } from '@dooksa/create-plugin'

/**
 * @import {Handler} from 'express'
 */

export const middleware = createPlugin('middleware', {
  data: {
    handlers: {
      'request/checkBody' (request, response, next) {
        if (Object.getPrototypeOf(request.body) !== Object.prototype || !Object.keys(request.body).length) {
          return response.status(400).json({
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
            return response.status(400).json({
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
  },
  methods: {
    /**
     * Get middleware
     * @param {string} name
     * @returns {Handler}
     */
    get (name) {
      const handler = this.handlers[name]

      if (!handler) {
        throw new Error('Middleware not found: ' + name)
      }

      return handler
    },
    /**
     * Set middleware
     * @param {Object} param
     * @param {string} param.name - Name of middleware
     * @param {Handler} param.handler - Express middleware
     */
    set ({ name, handler }) {
      this.handlers[name] = handler
    }
  }
})

export const { middlewareGet, middlewareSet } = middleware
export default middleware
