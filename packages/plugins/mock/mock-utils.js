/**
 * @import {TestContext} from 'node:test'
 */

/**
 * Creates a mock function that mimics the behavior of getValue from @dooksa/utils
 *
 * This mock function replicates the original getValue utility which retrieves values
 * from nested objects using dot notation or array queries. It supports:
 * - Direct value return when no query is provided
 * - Dot notation queries (e.g., 'a.b.c')
 * - Array queries for multiple values (e.g., ['a.b', 'c.d'])
 * - Handles null/undefined values gracefully
 *
 * @param {TestContext} t - The test context constructor
 * @returns {Function} A mock function that mimics getValue behavior
 *
 * @example
 * // Create mock getValue function
 * const mockGetValue = createMockGetValue(t)
 *
 * // Test with dot notation
 * const result = mockGetValue({ a: { b: 'c' } }, 'a.b')
 * // Returns: 'c'
 *
 * @example
 * // Test with array queries
 * const result = mockGetValue({ x: 1, y: 2 }, ['x', 'y'])
 * // Returns: [1, 2]
 *
 * @example
 * // Test with null value
 * const result = mockGetValue(null, 'any.property')
 * // Returns: undefined
 */
export function createMockGetValue (t) {
  return t.mock.fn((value, query) => {
    if (query == null) return value
    if (Array.isArray(query)) {
      return query.map(q => {
        const keys = q.split('.')
        let result = value
        for (const key of keys) {
          if (result == null) return undefined
          result = result[key]
        }
        return result
      })
    }
    if (typeof query !== 'string') return undefined
    const keys = query.split('.')
    let result = value
    for (const key of keys) {
      if (result == null) return undefined
      result = result[key]
    }
    return result
  })
}

/**
 * Creates a mock function that mimics the behavior of generateId from @dooksa/utils
 *
 * This mock function replicates the original generateId utility which generates
 * a unique identifier with a consistent format for testing purposes.
 *
 * @param {TestContext} t - The test context constructor
 * @returns {Function} A mock function that returns a test ID
 *
 * @example
 * // Create mock generateId function
 * const mockGenerateId = createMockGenerateId(t)
 *
 * // Generate a test ID
 * const id = mockGenerateId()
 * // Returns: '_test_id_12345_'
 *
 * @example
 * // Use in test assertions
 * const id = mockGenerateId()
 * strictEqual(id, '_test_id_12345_')
 */
export function createMockGenerateId (t) {
  return t.mock.fn(() => '_test_id_12345_')
}

/**
 * Creates a mock fetch function for testing HTTP requests
 *
 * This function provides a flexible mock for the global fetch API, allowing
 * controlled responses for testing fetch plugin behavior. It supports:
 * - Custom response data and status codes
 * - Error simulation
 * - Request verification (URL, method, headers)
 * - Multiple response scenarios
 *
 * @param {TestContext} t - The test context constructor
 * @param {Object} [options] - Configuration options for the mock
 * @param {Object|Function} [options.response] - Response data or function that returns response
 * @param {number} [options.status=200] - HTTP status code
 * @param {boolean} [options.ok=true] - Whether response is OK
 * @param {Error} [options.error] - Error to throw (for testing failures)
 * @param {Function} [options.onRequest] - Callback called with request details
 * @returns {Object} Mock object with fetch function and verification methods
 *
 * @example
 * // Simple successful response
 * const mock = createMockFetch(t, {
 *   response: { data: 'test' }
 * })
 *
 * @example
 * // Custom response per request
 * const mock = createMockFetch(t, {
 *   response: (url) => ({ url, timestamp: Date.now() })
 * })
 *
 * @example
 * // Error scenario
 * const mock = createMockFetch(t, {
 *   error: new Error('Network failure')
 * })
 *
 * @example
 * // Verify requests
 * const mock = createMockFetch(t, {
 *   response: { success: true },
 *   onRequest: (url, options) => {
 *     console.log('Request to:', url)
 *   }
 * })
 */
export function createMockFetch (t, options = {}) {
  const {
    response = { data: 'mock-response' },
    status = 200,
    ok = true,
    error = null,
    onRequest = null
  } = options

  const requests = []

  const mockFetch = async (url, options = {}) => {
    // Record the request
    const requestDetails = {
      url,
      options,
      timestamp: Date.now()
    }
    requests.push(requestDetails)

    // Call onRequest callback if provided
    if (onRequest) {
      onRequest(url, options)
    }

    // If error is configured, throw it
    if (error) {
      throw error
    }

    // Determine response data
    const responseData = typeof response === 'function'
      ? response(url, options)
      : response

    // Return mock response object
    return {
      ok,
      status,
      json: async () => responseData,
      text: async () => JSON.stringify(responseData),
      headers: new Headers(),
      statusText: ok ? 'OK' : 'Error'
    }
  }

  return {
    fetch: mockFetch,
    requests,
    getLastRequest: () => requests[requests.length - 1],
    getRequestsByURL: (pattern) => {
      const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern)
      return requests.filter(req => regex.test(req.url))
    },
    clearRequests: () => {
      requests.length = 0
    },
    verifyRequestCount: (count) => {
      if (requests.length !== count) {
        throw new Error(`Expected ${count} requests, but got ${requests.length}`)
      }
    }
  }
}

/**
 * Creates a mock fetch function that simulates caching behavior
 *
 * This mock is specifically designed for testing the fetch plugin's cache
 * functionality. It can return different responses based on the request URL
 * and track cache hits/misses.
 *
 * @param {TestContext} t - The test context constructor
 * @param {Object} [options] - Configuration options
 * @param {Map<string, Object>} [options.cache] - Pre-populated cache
 * @param {Function} [options.onCacheHit] - Callback when cache is hit
 * @param {Function} [options.onCacheMiss] - Callback when cache is missed
 * @returns {Object} Mock fetch with cache tracking
 *
 * @example
 * // Test cache behavior
 * const cache = new Map()
 * cache.set('collection1', { data: 'cached' })
 *
 * const mock = createMockFetchWithCache(t, { cache })
 *
 * // First call - cache miss
 * await mock.fetch('/_/collection1')
 *
 * // Second call - cache hit
 * await mock.fetch('/_/collection1')
 */
export function createMockFetchWithCache (t, options = {}) {
  const {
    cache = new Map(),
    onCacheHit = null,
    onCacheMiss = null
  } = options

  const cacheHits = []
  const cacheMisses = []

  const mockFetch = async (url) => {
    const cacheKey = url.replace('/_/', '')

    if (cache.has(cacheKey)) {
      if (onCacheHit) onCacheHit(cacheKey)
      cacheHits.push({
        url,
        key: cacheKey,
        timestamp: Date.now()
      })

      return {
        ok: true,
        status: 200,
        json: async () => cache.get(cacheKey)
      }
    }

    if (onCacheMiss) onCacheMiss(cacheKey)
    cacheMisses.push({
      url,
      key: cacheKey,
      timestamp: Date.now()
    })

    // Return fresh data
    return {
      ok: true,
      status: 200,
      json: async () => {
        // Generate mock data based on URL
        const collection = cacheKey.split('?')[0]
        return [
          {
            id: `test-${Date.now()}`,
            collection,
            item: {
              name: 'test',
              value: 42
            }
          }
        ]
      }
    }
  }

  return {
    fetch: mockFetch,
    cache,
    cacheHits,
    cacheMisses,
    getCacheHitCount: () => cacheHits.length,
    getCacheMissCount: () => cacheMisses.length,
    clearTracking: () => {
      cacheHits.length = 0
      cacheMisses.length = 0
    }
  }
}

/**
 * Creates a mock fetch function that simulates network errors
 *
 * Useful for testing error handling in fetch operations.
 *
 * @param {TestContext} t - The test context constructor
 * @param {Object} [options] - Error configuration
 * @param {string} [options.message='Network error'] - Error message
 * @param {Error} [options.error] - Custom error object
 * @returns {Function} Mock fetch that always throws
 *
 * @example
 * // Test network failure
 * const mockFetch = createMockFetchError(t, {
 *   message: 'Connection timeout'
 * })
 *
 * // Replace global fetch
 * global.fetch = mockFetch
 */
export function createMockFetchError (t, options = {}) {
  const {
    message = 'Network error',
    error = new Error(message)
  } = options

  return async () => {
    throw error
  }
}

/**
 * Creates a mock fetch function that simulates HTTP error responses
 *
 * For testing non-OK responses (404, 500, etc.) without network errors.
 *
 * @param {TestContext} t - The test context constructor
 * @param {Object} [options] - Response configuration
 * @param {number} [options.status=404] - HTTP status code
 * @param {string} [options.statusText='Not Found'] - Status text
 * @param {Object} [options.body] - Response body
 * @returns {Function} Mock fetch returning error response
 *
 * @example
 * // Test 404 response
 * const mockFetch = createMockFetchHttpError(t, {
 *   status: 404,
 *   statusText: 'Not Found'
 * })
 */
export function createMockFetchHttpError (t, options = {}) {
  const {
    status = 404,
    statusText = 'Not Found',
    body = { error: 'Resource not found' }
  } = options

  return async () => ({
    ok: false,
    status,
    statusText,
    json: async () => body,
    text: async () => JSON.stringify(body)
  })
}
