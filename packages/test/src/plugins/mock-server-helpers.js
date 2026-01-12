/**
 * Helper utilities for mock server plugin testing
 * @import {TestContext} from 'node:test'
 */

/**
 * Creates a mock Express request object
 * @param {Object} [overrides={}] - Override default request properties
 * @returns {Object} Mock Express request
 */
export function createRequest (overrides = {}) {
  const request = {
    method: 'GET',
    path: '/',
    params: {},
    query: {},
    body: {},
    cookies: {},
    signedCookies: {},
    headers: {},
    userId: null,
    ...overrides
  }
  return request
}

/**
 * Creates a mock Express response object
 * @returns {Object} Mock Express response with tracking capabilities
 */
export function createResponse () {
  const headers = {}
  const response = {
    statusCode: 200,
    headers,
    body: null,
    cookies: {},

    /**
     * Set HTTP status code
     * @param {number} code - HTTP status code
     * @returns {Object} Response instance
     */
    status (code) {
      this.statusCode = code
      return this
    },

    /**
     * Send response body
     * @param {*} data - Response data
     * @returns {Object} Response instance
     */
    send (data) {
      this.body = data
      return this
    },

    /**
     * Send JSON response
     * @param {*} data - Data to stringify
     * @returns {Object} Response instance
     */
    json (data) {
      this.body = data
      this.headers['Content-Type'] = 'application/json'
      return this
    },

    /**
     * Send HTML response
     * @param {string} data - HTML string
     * @returns {Object} Response instance
     */
    html (data) {
      this.body = data
      this.headers['Content-Type'] = 'text/html'
      return this
    },

    /**
     * Set response header(s)
     * @param {string|Object} key - Header name or object of headers
     * @param {*} [value] - Header value
     * @returns {Object} Response instance
     */
    set (key, value) {
      if (typeof key === 'object') {
        Object.assign(headers, key)
      } else {
        headers[key] = value
      }
      return this
    },

    /**
     * Set cookie
     * @param {string} name - Cookie name
     * @param {*} value - Cookie value
     * @param {Object} [options] - Cookie options
     * @returns {Object} Response instance
     */
    cookie (name, value, options) {
      this.cookies[name] = {
        value,
        options
      }
      return this
    }
  }
  return response
}

/**
 * Invokes a registered route handler with request and response
 * @param {Object} app - Mock Express app with routes
 * @param {string} path - Route path to invoke
 * @param {Object} request - Mock request object
 * @param {Object} response - Mock response object
 * @returns {Promise<Object>} Response object after handler execution
 */
export async function invokeRoute (app, path, request, response) {
  const route = app.routes.find(r => {
    // Simple path matching - can be enhanced
    if (r.path === path) return true
    if (r.path.includes(':')) {
      // Handle parameterized paths
      const routeParts = r.path.split('/')
      const pathParts = path.split('/')
      if (routeParts.length === pathParts.length) {
        for (let i = 0; i < routeParts.length; i++) {
          if (routeParts[i].startsWith(':')) continue
          if (routeParts[i] !== pathParts[i]) return false
        }
        return true
      }
    }
    return false
  })

  if (!route) {
    throw new Error(`Route not found: ${path}`)
  }

  // Execute handlers in sequence
  let currentRequest = request
  let currentResponse = response
  let handlerIndex = 0

  const next = () => {
    if (handlerIndex < route.handlers.length) {
      const handler = route.handlers[handlerIndex++]
      return handler(currentRequest, currentResponse, next)
    }
  }

  await next()
  return response
}
