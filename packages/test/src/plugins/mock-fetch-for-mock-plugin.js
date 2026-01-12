/**
 * Creates a fetch mock that integrates with mockPlugin
 * This allows fetch plugin to communicate with the mock Express server
 *
 * @import {MockPlugin} from './mock-plugin.js'
 * @import {TestContext} from 'node:test'
 */

/**
 * Creates a fetch function that routes requests through the mock Express app
 * @param {MockPlugin} mock - The mockPlugin instance
 * @param {TestContext} context - Node.js TestContext for creating mocks
 * @returns {Object} Object with fetch function and request tracking
 */
export function createMockFetchForMockPlugin (mock, context) {
  const requests = []

  /**
   * Mock fetch function that routes through mock Express app
   * @param {string|Request} input - URL or Request object
   * @param {Object} [init] - Request options
   * @returns {Promise<Response>} Fetch Response object
   */
  async function mockFetch (input, init = {}) {
    // Parse URL
    const url = typeof input === 'string' ? input : input.url
    const urlObj = new URL(url, 'http://localhost:6362')

    // Extract path and query
    const path = urlObj.pathname
    const query = {}
    urlObj.searchParams.forEach((value, key) => {
      // Handle array parameters like ?id=1&id=2
      if (query[key]) {
        if (Array.isArray(query[key])) {
          query[key].push(value)
        } else {
          query[key] = [query[key], value]
        }
      } else {
        query[key] = value
      }
    })

    // Convert query strings to appropriate types
    if (query.id && !Array.isArray(query.id)) {
      query.id = [query.id]
    }
    if (query.page) query.page = parseInt(query.page)
    if (query.perPage) query.perPage = parseInt(query.perPage)
    if (query.limit) query.limit = parseInt(query.limit)
    if (query.expand) query.expand = query.expand === 'true'

    // Store request for tracking
    const requestInfo = {
      url,
      method: (init.method || 'GET').toUpperCase(),
      path,
      query,
      timestamp: Date.now()
    }
    requests.push(requestInfo)

    // Create mock Express request
    const mockRequest = {
      method: requestInfo.method,
      path,
      params: {},
      query,
      body: init.body ? JSON.parse(init.body) : {},
      cookies: {},
      signedCookies: {},
      headers: init.headers || {},
      userId: null
    }

    // Create mock Express response
    const mockResponse = mock.createResponse()

    try {
      // Try to invoke the route
      await mock.invokeRoute(path, mockRequest, mockResponse)

      // Convert Express response to Fetch Response
      const responseOptions = {
        status: mockResponse.statusCode,
        headers: new Headers(mockResponse.headers)
      }

      // Set content type for JSON
      if (mockResponse.headers['Content-Type'] === 'application/json') {
        responseOptions.headers.set('Content-Type', 'application/json')
      }

      // Create response body
      let responseBody
      if (mockResponse.body !== null && mockResponse.body !== undefined) {
        if (typeof mockResponse.body === 'string') {
          responseBody = mockResponse.body
        } else {
          responseBody = JSON.stringify(mockResponse.body)
        }
      } else {
        responseBody = ''
      }

      // Create the Response object
      const response = new Response(responseBody, responseOptions)

      // If response is not OK (status >= 400), throw error
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response
    } catch (error) {
      // If route not found or other error, return appropriate response
      if (error.message.includes('Route not found')) {
        const response = new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: new Headers({ 'Content-Type': 'application/json' })
        })
        return response
      }

      // Re-throw other errors
      throw error
    }
  }

  return {
    fetch: mockFetch,
    requests
  }
}

/**
 * Creates a mock fetch function for use in tests
 * This is a simplified version that works with the mockPlugin framework
 *
 * @param {TestContext} context - Node.js TestContext
 * @param {Object} [options] - Mock options
 * @param {Array|Function} [options.response] - Response data or function that returns data
 * @param {boolean} [options.ok=true] - Whether response is OK
 * @param {number} [options.status=200] - HTTP status code
 * @param {Error} [options.error] - Error to throw
 * @param {Function} [options.onRequest] - Callback when fetch is called
 * @returns {Object} Mock fetch with tracking
 */
export function createMockFetch (context, options = {}) {
  const requests = []
  const { response, ok = true, status = 200, error, onRequest } = options

  async function mockFetch (input, init = {}) {
    const url = typeof input === 'string' ? input : input.url

    requests.push({
      url,
      method: (init.method || 'GET').toUpperCase(),
      timestamp: Date.now()
    })

    if (onRequest) {
      onRequest(url, init)
    }

    if (error) {
      throw error
    }

    // If no response provided, return empty success
    if (!response) {
      return {
        ok: true,
        status: 200,
        json: async () => ({}),
        text: async () => ''
      }
    }

    let data
    if (typeof response === 'function') {
      data = response(url, init)
    } else {
      data = response
    }

    const responseObj = {
      ok,
      status,
      json: async () => data,
      text: async () => JSON.stringify(data)
    }

    if (!ok) {
      return Promise.reject(new Error(`HTTP error! status: ${status}`))
    }

    return responseObj
  }

  return {
    fetch: mockFetch,
    requests
  }
}
