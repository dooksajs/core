/**
 * Mock Express module that replaces the real express()
 * with our mock app for testing
 * @import {TestContext, Mock} from 'node:test'
 */

/**
 * @typedef {Object} MockExpressApp
 * @property {Mock<Function>} get - Mock HTTP GET route handler
 * @property {Mock<Function>} post - Mock HTTP POST route handler
 * @property {Mock<Function>} put - Mock HTTP PUT route handler
 * @property {Mock<Function>} delete - Mock HTTP DELETE route handler
 * @property {Mock<Function>} use - Mock middleware registration
 * @property {Mock<Function>} listen - Mock server listen method
 * @property {Function} get routes - Getter that returns array of registered routes
 * @property {Function} get middleware - Getter that returns array of registered middleware
 */

/**
 * Creates a mock Express module that returns the mock app
 * @param {TestContext} context - Node.js TestContext for creating mocks
 * @param {Object} mock - Object to store the mock app reference
 * @returns {Mock<Function> & { json: Function, urlencoded: Function, static: Function, Router: Function }} Mocked express module exports
 */
export function createMockExpressModule(context, mock) {
  /**
   * Mock express app
   * @returns {MockExpressApp}
   */
  function express() {
    const routes = []
    const middleware = []

    const app = {
      // HTTP methods that track routes independently
      get: context.mock.fn((path, ...handlers) => {
        routes.push({ method: 'get', path, handlers })
      }),
      post: context.mock.fn((path, ...handlers) => {
        routes.push({ method: 'post', path, handlers })
      }),
      put: context.mock.fn((path, ...handlers) => {
        routes.push({ method: 'put', path, handlers })
      }),
      delete: context.mock.fn((path, ...handlers) => {
        routes.push({ method: 'delete', path, handlers })
      }),
      // Middleware registration
      use: context.mock.fn((...args) => {
        if (typeof args[0] === 'function') {
          middleware.push(args[0])
        } else if (typeof args[0] === 'string') {
          middleware.push({ path: args[0], handler: args[1] })
        }
      }),
      // Listen method for starting the server
      listen: context.mock.fn((port, callback) => {
        // Create a mock server object
        const server = {
          close: context.mock.fn((cb) => {
            if (cb) cb()
          }),
          on: context.mock.fn((event, handler) => {
            // Store error handler for later use
            if (event === 'error') {
              server._errorHandler = handler
            }
          })
        }

        // Call the callback asynchronously
        if (callback) {
          setTimeout(() => callback(), 0)
        }

        return server
      }),
      get routes () {
        return [...routes]
      },
      get middleware () {
        return [...middleware]
      }
    }

    // Mutate mock 
    mock.app = app

    return app
  }

  // Attach middleware factories to the express function
  // These are called by http.js: express.json(), express.urlencoded(), express.static()
  express.json = () => (req, res, next) => next()
  express.urlencoded = (options) => (req, res, next) => next()
  express.static = (path, options) => (req, res, next) => next()

  // Also attach Router constructor (even if not used by http.js, it's part of express API)
  express.Router = function () {
    const routes = []
    const middleware = []

    return {
      get: (path, ...handlers) => {
        routes.push({ method: 'get', path, handlers })
      },
      post: (path, ...handlers) => {
        routes.push({ method: 'post', path, handlers })
      },
      put: (path, ...handlers) => {
        routes.push({ method: 'put', path, handlers })
      },
      delete: (path, ...handlers) => {
        routes.push({ method: 'delete', path, handlers })
      },
      use: (...args) => {
        if (typeof args[0] === 'function') {
          middleware.push(args[0])
        } else if (typeof args[0] === 'string') {
          middleware.push({ path: args[0], handler: args[1] })
        }
      },
      _getRoutes: () => [...routes],
      _getMiddleware: () => [...middleware]
    }
  }

  // Now mock the entire express function (including its properties)
  return context.mock.fn(express)
}
