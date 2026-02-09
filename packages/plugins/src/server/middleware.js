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
      'request/queryIdIsArray' (request, response, next) {
        const queryId = request.query.id

        if (typeof request.data !== 'object') {
          request.data = {}
        }

        if (queryId) {
          if (!Array.isArray(queryId)) {
            request.data.id = [queryId]
          } else {
            request.data.id = queryId
          }
        }

        next()
      }
    }
  },
  methods: {
    /**
     * Get middleware
     * @param {string} name - Middleware name
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
     * @param {Object} param - Parameters object
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
