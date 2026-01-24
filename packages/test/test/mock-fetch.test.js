/**
 * Comprehensive test suite for mock-fetch.js utility functions
 *
 * Tests all four main functions:
 * - createMockFetch
 * - createMockFetchWithCache
 * - createMockFetchError
 * - createMockFetchHttpError
 */

import { describe, it } from 'node:test'
import { strictEqual, deepStrictEqual } from 'node:assert'
import {
  createMockFetch,
  createMockFetchWithCache,
  createMockFetchError,
  createMockFetchHttpError
} from '../src/utils/mock-fetch.js'

describe('createMockFetch', () => {
  describe('Basic functionality tests', () => {
    it('testCreateMockFetchBasicResponse - Tests basic successful response', async (t) => {
      const mock = createMockFetch(t, {
        response: { data: 'test' }
      })

      const response = await mock.fetch('http://example.com/api')
      const data = await response.json()

      strictEqual(response.ok, true)
      strictEqual(response.status, 200)
      deepStrictEqual(data, { data: 'test' })

      mock.restore()
    })

    it('testCreateMockFetchCustomResponse - Tests custom response data', async (t) => {
      const mock = createMockFetch(t, {
        response: {
          custom: 'data',
          nested: { value: 42 }
        }
      })

      const response = await mock.fetch('http://example.com/api')
      const data = await response.json()

      deepStrictEqual(data, {
        custom: 'data',
        nested: { value: 42 }
      })

      mock.restore()
    })

    it('testCreateMockFetchFunctionResponse - Tests function-based response', async (t) => {
      const mock = createMockFetch(t, {
        response: (url, options) => ({
          url,
          method: options.method || 'GET',
          timestamp: Date.now()
        })
      })

      const response = await mock.fetch('http://example.com/api', { method: 'POST' })
      const data = await response.json()

      strictEqual(data.url, 'http://example.com/api')
      strictEqual(data.method, 'POST')
      strictEqual(typeof data.timestamp, 'number')

      mock.restore()
    })

    it('testCreateMockFetchErrorScenario - Tests error throwing', async (t) => {
      const testError = new Error('Network failure')
      const mock = createMockFetch(t, {
        error: testError
      })

      try {
        await mock.fetch('http://example.com/api')
        throw new Error('Should have thrown error')
      } catch (error) {
        strictEqual(error.message, 'Network failure')
      }

      mock.restore()
    })

    it('testCreateMockFetchCustomStatus - Tests custom status codes', async (t) => {
      const mock = createMockFetch(t, {
        response: { data: 'test' },
        status: 201,
        ok: true
      })

      const response = await mock.fetch('http://example.com/api')

      strictEqual(response.status, 201)
      strictEqual(response.ok, true)

      mock.restore()
    })

    it('testCreateMockFetchOkFalse - Tests ok=false scenario', async (t) => {
      const mock = createMockFetch(t, {
        response: { error: 'Not authorized' },
        status: 401,
        ok: false
      })

      const response = await mock.fetch('http://example.com/api')

      strictEqual(response.status, 401)
      strictEqual(response.ok, false)

      mock.restore()
    })

    it('testCreateMockFetchSpecialResponseObject - Tests response with special methods', async (t) => {
      const mock = createMockFetch(t, {
        response: {
          ok: true,
          status: 200,
          json: async () => ({ special: 'method' }),
          text: async () => 'special text',
          headers: new Headers({ 'content-type': 'application/json' }),
          statusText: 'Custom OK'
        }
      })

      const response = await mock.fetch('http://example.com/api')

      strictEqual(response.ok, true)
      strictEqual(response.status, 200)
      strictEqual(response.statusText, 'Custom OK')
      deepStrictEqual(await response.json(), { special: 'method' })
      strictEqual(await response.text(), 'special text')

      mock.restore()
    })

    it('testCreateMockFetchMalformedJson - Tests malformed JSON response handling', async (t) => {
      const mock = createMockFetch(t, {
        response: {
          json: async () => {
            throw new SyntaxError('Unexpected token')
          }
        }
      })

      const response = await mock.fetch('http://example.com/api')

      try {
        await response.json()
        throw new Error('Should have thrown error')
      } catch (error) {
        strictEqual(error.message, 'Unexpected token')
      }

      mock.restore()
    })
  })

  describe('Advanced features tests (request tracking, callbacks)', () => {
    it('testCreateMockFetchOnRequestCallback - Tests onRequest callback', async (t) => {
      let callbackCalled = false
      let capturedUrl = null
      let capturedOptions = null

      const mock = createMockFetch(t, {
        response: { data: 'test' },
        onRequest: (url, options) => {
          callbackCalled = true
          capturedUrl = url
          capturedOptions = options
        }
      })

      await mock.fetch('http://example.com/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      strictEqual(callbackCalled, true)
      strictEqual(capturedUrl, 'http://example.com/api')
      strictEqual(capturedOptions.method, 'POST')
      strictEqual(capturedOptions.headers['Content-Type'], 'application/json')

      mock.restore()
    })

    it('testCreateMockFetchRequestVerification - Tests request tracking', async (t) => {
      const mock = createMockFetch(t, {
        response: { data: 'test' }
      })

      await mock.fetch('http://example.com/api/1')
      await mock.fetch('http://example.com/api/2')
      await mock.fetch('http://example.com/api/1')

      strictEqual(mock.requests.length, 3)
      strictEqual(mock.requests[0].url, 'http://example.com/api/1')
      strictEqual(mock.requests[1].url, 'http://example.com/api/2')
      strictEqual(mock.requests[2].url, 'http://example.com/api/1')

      mock.restore()
    })

    it('testCreateMockFetchGetLastRequest - Tests getLastRequest method', async (t) => {
      const mock = createMockFetch(t, {
        response: { data: 'test' }
      })

      // Initially no requests
      strictEqual(mock.getLastRequest(), undefined)

      await mock.fetch('http://example.com/api/1')
      await mock.fetch('http://example.com/api/2')

      const lastRequest = mock.getLastRequest()
      strictEqual(lastRequest.url, 'http://example.com/api/2')

      mock.restore()
    })

    it('testCreateMockFetchGetRequestsByURL - Tests filtering requests by URL', async (t) => {
      const mock = createMockFetch(t, {
        response: { data: 'test' }
      })

      await mock.fetch('http://example.com/api/1')
      await mock.fetch('http://example.com/api/2')
      await mock.fetch('http://example.com/api/1')
      await mock.fetch('http://example.com/other')

      const apiRequests = mock.getRequestsByURL(/api/)
      strictEqual(apiRequests.length, 3)
      strictEqual(apiRequests[0].url, 'http://example.com/api/1')
      strictEqual(apiRequests[1].url, 'http://example.com/api/2')
      strictEqual(apiRequests[2].url, 'http://example.com/api/1')

      const specificRequests = mock.getRequestsByURL(/api\/1/)
      strictEqual(specificRequests.length, 2)

      mock.restore()
    })

    it('testCreateMockFetchClearRequests - Tests clearing request history', async (t) => {
      const mock = createMockFetch(t, {
        response: { data: 'test' }
      })

      await mock.fetch('http://example.com/api/1')
      await mock.fetch('http://example.com/api/2')

      strictEqual(mock.requests.length, 2)

      mock.clearRequests()

      strictEqual(mock.requests.length, 0)
      strictEqual(mock.getLastRequest(), undefined)

      mock.restore()
    })

    it('testCreateMockFetchVerifyRequestCount - Tests request count verification', async (t) => {
      const mock = createMockFetch(t, {
        response: { data: 'test' }
      })

      await mock.fetch('http://example.com/api/1')
      await mock.fetch('http://example.com/api/2')
      await mock.fetch('http://example.com/api/3')

      // Should not throw
      mock.verifyRequestCount(3)

      // Should throw
      try {
        mock.verifyRequestCount(2)
        throw new Error('Should have thrown error')
      } catch (error) {
        strictEqual(error.message, 'Expected 2 requests, but got 3')
      }

      mock.restore()
    })

    it('testCreateMockFetchRestore - Tests restoring original fetch', async (t) => {
      const originalFetch = global.fetch
      const mock = createMockFetch(t, {
        response: { data: 'test' }
      })

      global.fetch = mock.fetch
      strictEqual(global.fetch, mock.fetch)

      mock.restore()
      strictEqual(global.fetch, originalFetch)

      mock.restore() // Should be safe to call multiple times
    })
  })
})

describe('createMockFetchWithCache', () => {
  describe('Cache behavior tests', () => {
    it('testCreateMockFetchWithCacheHit - Tests cache hit scenario', async (t) => {
      const cache = new Map()
      cache.set('collection1', { data: 'cached' })

      const mock = createMockFetchWithCache(t, { cache })

      const response = await mock.fetch('/_/collection1')
      const data = await response.json()

      strictEqual(response.ok, true)
      strictEqual(response.status, 200)
      deepStrictEqual(data, { data: 'cached' })

      mock.restore()
    })

    it('testCreateMockFetchWithCacheMiss - Tests cache miss scenario', async (t) => {
      const cache = new Map()
      const mock = createMockFetchWithCache(t, { cache })

      const response = await mock.fetch('/_/collection1')
      const data = await response.json()

      strictEqual(response.ok, true)
      strictEqual(response.status, 200)
      strictEqual(Array.isArray(data), true)
      strictEqual(data.length, 1)
      strictEqual(data[0].collection, 'collection1')

      mock.restore()
    })

    it('testCreateMockFetchWithCachePrepopulated - Tests with pre-populated cache', async (t) => {
      const cache = new Map()
      cache.set('collection1', { data: 'cached1' })
      cache.set('collection2', { data: 'cached2' })
      cache.set('collection3', { data: 'cached3' })

      const mock = createMockFetchWithCache(t, { cache })

      const response1 = await mock.fetch('/_/collection1')
      const response2 = await mock.fetch('/_/collection2')
      const response3 = await mock.fetch('/_/collection3')

      const data1 = await response1.json()
      const data2 = await response2.json()
      const data3 = await response3.json()

      deepStrictEqual(data1, { data: 'cached1' })
      deepStrictEqual(data2, { data: 'cached2' })
      deepStrictEqual(data3, { data: 'cached3' })

      mock.restore()
    })

    it('testCreateMockFetchWithCacheHitCallback - Tests onCacheHit callback', async (t) => {
      const cache = new Map()
      cache.set('collection1', { data: 'cached' })

      let hitCallbackCalled = false
      let hitCallbackKey = null

      const mock = createMockFetchWithCache(t, {
        cache,
        onCacheHit: (key) => {
          hitCallbackCalled = true
          hitCallbackKey = key
        }
      })

      await mock.fetch('/_/collection1')

      strictEqual(hitCallbackCalled, true)
      strictEqual(hitCallbackKey, 'collection1')

      mock.restore()
    })

    it('testCreateMockFetchWithCacheMissCallback - Tests onCacheMiss callback', async (t) => {
      const cache = new Map()

      let missCallbackCalled = false
      let missCallbackKey = null

      const mock = createMockFetchWithCache(t, {
        cache,
        onCacheMiss: (key) => {
          missCallbackCalled = true
          missCallbackKey = key
        }
      })

      await mock.fetch('/_/collection1')

      strictEqual(missCallbackCalled, true)
      strictEqual(missCallbackKey, 'collection1')

      mock.restore()
    })

    it('testCreateMockFetchWithCacheTracking - Tests cache hit/miss tracking', async (t) => {
      const cache = new Map()
      cache.set('collection1', { data: 'cached' })

      const mock = createMockFetchWithCache(t, { cache })

      // Cache miss
      await mock.fetch('/_/collection2')
      // Cache hit
      await mock.fetch('/_/collection1')
      // Cache miss
      await mock.fetch('/_/collection3')
      // Cache hit
      await mock.fetch('/_/collection1')

      strictEqual(mock.getCacheHitCount(), 2)
      strictEqual(mock.getCacheMissCount(), 2)
      strictEqual(mock.cacheHits.length, 2)
      strictEqual(mock.cacheMisses.length, 2)

      mock.restore()
    })

    it('testCreateMockFetchWithCacheClearTracking - Tests clearing tracking data', async (t) => {
      const cache = new Map()
      cache.set('collection1', { data: 'cached' })

      const mock = createMockFetchWithCache(t, { cache })

      await mock.fetch('/_/collection2')
      await mock.fetch('/_/collection1')

      strictEqual(mock.getCacheHitCount(), 1)
      strictEqual(mock.getCacheMissCount(), 1)

      mock.clearTracking()

      strictEqual(mock.getCacheHitCount(), 0)
      strictEqual(mock.getCacheMissCount(), 0)
      strictEqual(mock.cacheHits.length, 0)
      strictEqual(mock.cacheMisses.length, 0)

      mock.restore()
    })

    it('testCreateMockFetchWithCacheRestore - Tests restoring original fetch', async (t) => {
      const originalFetch = global.fetch
      const cache = new Map()
      const mock = createMockFetchWithCache(t, { cache })

      global.fetch = mock.fetch
      strictEqual(global.fetch, mock.fetch)

      mock.restore()
      strictEqual(global.fetch, originalFetch)

      mock.restore() // Should be safe to call multiple times
    })

    it('testCreateMockFetchWithCacheQueryParams - Tests URL with query parameters', async (t) => {
      const cache = new Map()
      cache.set('collection1', { data: 'cached' })

      const mock = createMockFetchWithCache(t, { cache })

      // URL with query params - cache key includes query params
      // So this will be a cache miss and generate new data
      const response = await mock.fetch('/_/collection1?param=value')
      const data = await response.json()

      // Should return new data since cache key includes query params
      strictEqual(Array.isArray(data), true)
      strictEqual(data.length, 1)
      strictEqual(data[0].collection, 'collection1')

      mock.restore()
    })

    it('testCreateMockFetchWithCacheCollectionExtraction - Tests collection key extraction', async (t) => {
      const cache = new Map()
      const mock = createMockFetchWithCache(t, { cache })

      await mock.fetch('/_/users')
      await mock.fetch('/_/posts')
      await mock.fetch('/_/comments')

      strictEqual(mock.cacheMisses.length, 3)
      strictEqual(mock.cacheMisses[0].key, 'users')
      strictEqual(mock.cacheMisses[1].key, 'posts')
      strictEqual(mock.cacheMisses[2].key, 'comments')

      mock.restore()
    })
  })
})

describe('createMockFetchError', () => {
  describe('Error handling tests', () => {
    it('testCreateMockFetchErrorBasic - Tests basic error throwing', async (t) => {
      const mock = createMockFetchError(t)

      try {
        await mock.fetch('http://example.com/api')
        throw new Error('Should have thrown error')
      } catch (error) {
        strictEqual(error.message, 'Network error')
      }

      mock.restore()
    })

    it('testCreateMockFetchErrorCustomMessage - Tests custom error message', async (t) => {
      const mock = createMockFetchError(t, {
        message: 'Connection timeout'
      })

      try {
        await mock.fetch('http://example.com/api')
        throw new Error('Should have thrown error')
      } catch (error) {
        strictEqual(error.message, 'Connection timeout')
      }

      mock.restore()
    })

    it('testCreateMockFetchErrorCustomErrorObject - Tests custom error object', async (t) => {
      const customError = new Error('Custom error')
      customError.code = 'ECONNREFUSED'

      const mock = createMockFetchError(t, {
        error: customError
      })

      try {
        await mock.fetch('http://example.com/api')
        throw new Error('Should have thrown error')
      } catch (error) {
        strictEqual(error.message, 'Custom error')
        strictEqual(error.code, 'ECONNREFUSED')
      }

      mock.restore()
    })

    it('testCreateMockFetchErrorRestore - Tests restoring original fetch', async (t) => {
      const originalFetch = global.fetch
      const mock = createMockFetchError(t)

      global.fetch = mock.fetch
      strictEqual(global.fetch, mock.fetch)

      mock.restore()
      strictEqual(global.fetch, originalFetch)

      mock.restore() // Should be safe to call multiple times
    })
  })
})

describe('createMockFetchHttpError', () => {
  describe('HTTP error response tests', () => {
    it('testCreateMockFetchHttpErrorBasic - Tests basic HTTP error response', async (t) => {
      const mock = createMockFetchHttpError(t)

      const response = await mock.fetch('http://example.com/api')

      strictEqual(response.ok, false)
      strictEqual(response.status, 404)
      strictEqual(response.statusText, 'Not Found')

      const data = await response.json()
      deepStrictEqual(data, { error: 'Resource not found' })

      mock.restore()
    })

    it('testCreateMockFetchHttpErrorCustomStatus - Tests custom status code', async (t) => {
      const mock = createMockFetchHttpError(t, {
        status: 500,
        statusText: 'Internal Server Error'
      })

      const response = await mock.fetch('http://example.com/api')

      strictEqual(response.ok, false)
      strictEqual(response.status, 500)
      strictEqual(response.statusText, 'Internal Server Error')

      mock.restore()
    })

    it('testCreateMockFetchHttpErrorCustomStatusText - Tests custom status text', async (t) => {
      const mock = createMockFetchHttpError(t, {
        status: 403,
        statusText: 'Forbidden'
      })

      const response = await mock.fetch('http://example.com/api')

      strictEqual(response.ok, false)
      strictEqual(response.status, 403)
      strictEqual(response.statusText, 'Forbidden')

      mock.restore()
    })

    it('testCreateMockFetchHttpErrorCustomBody - Tests custom response body', async (t) => {
      const mock = createMockFetchHttpError(t, {
        status: 401,
        statusText: 'Unauthorized',
        body: {
          error: 'Invalid credentials',
          code: 'AUTH_ERROR'
        }
      })

      const response = await mock.fetch('http://example.com/api')

      strictEqual(response.ok, false)
      strictEqual(response.status, 401)

      const data = await response.json()
      deepStrictEqual(data, {
        error: 'Invalid credentials',
        code: 'AUTH_ERROR'
      })

      mock.restore()
    })

    it('testCreateMockFetchHttpErrorRestore - Tests restoring original fetch', async (t) => {
      const originalFetch = global.fetch
      const mock = createMockFetchHttpError(t)

      global.fetch = mock.fetch
      strictEqual(global.fetch, mock.fetch)

      mock.restore()
      strictEqual(global.fetch, originalFetch)

      mock.restore() // Should be safe to call multiple times
    })
  })
})

describe('Integration and edge case tests', () => {
  it('testMultipleMockFetchInstances - Tests multiple mock instances', async (t) => {
    const mock1 = createMockFetch(t, {
      response: { data: 'mock1' }
    })

    const mock2 = createMockFetch(t, {
      response: { data: 'mock2' }
    })

    const response1 = await mock1.fetch('http://example.com/api/1')
    const response2 = await mock2.fetch('http://example.com/api/2')

    const data1 = await response1.json()
    const data2 = await response2.json()

    deepStrictEqual(data1, { data: 'mock1' })
    deepStrictEqual(data2, { data: 'mock2' })

    strictEqual(mock1.requests.length, 1)
    strictEqual(mock2.requests.length, 1)

    mock1.restore()
    mock2.restore()
  })

  it('testMockFetchGlobalFetchOverride - Tests global.fetch override behavior', async (t) => {
    const originalFetch = global.fetch
    const mock = createMockFetch(t, {
      response: { data: 'overridden' }
    })

    // Override global.fetch
    global.fetch = mock.fetch

    const response = await global.fetch('http://example.com/api')
    const data = await response.json()

    deepStrictEqual(data, { data: 'overridden' })

    // Restore
    mock.restore()
    strictEqual(global.fetch, originalFetch)
  })

  it('testMockFetchAsyncResponse - Tests async response handling', async (t) => {
    const mock = createMockFetch(t, {
      response: async (url) => {
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 10))
        return {
          url,
          async: true
        }
      }
    })

    const response = await mock.fetch('http://example.com/api')
    const data = await response.json()

    strictEqual(data.url, 'http://example.com/api')
    strictEqual(data.async, true)

    mock.restore()
  })

  it('testMockFetchWithHeaders - Tests response with custom headers', async (t) => {
    const mock = createMockFetch(t, {
      response: { data: 'test' }
    })

    const response = await mock.fetch('http://example.com/api')

    strictEqual(response.headers instanceof Headers, true)
    strictEqual(response.headers.get('content-type'), null) // Headers are empty by default

    mock.restore()
  })

  it('testMockFetchEmptyResponse - Tests empty response handling', async (t) => {
    const mock = createMockFetch(t, {
      response: {}
    })

    const response = await mock.fetch('http://example.com/api')
    const data = await response.json()

    deepStrictEqual(data, {})

    mock.restore()
  })

  it('testMockFetchLargeData - Tests large response data', async (t) => {
    const largeData = {
      items: Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random()
      }))
    }

    const mock = createMockFetch(t, {
      response: largeData
    })

    const response = await mock.fetch('http://example.com/api')
    const data = await response.json()

    strictEqual(data.items.length, 1000)
    strictEqual(data.items[0].id, 0)
    strictEqual(data.items[999].id, 999)

    mock.restore()
  })

  it('testMockFetchConcurrentRequests - Tests concurrent request handling', async (t) => {
    const mock = createMockFetch(t, {
      response: (url) => ({
        url,
        timestamp: Date.now()
      })
    })

    // Make concurrent requests
    const promises = [
      mock.fetch('http://example.com/api/1'),
      mock.fetch('http://example.com/api/2'),
      mock.fetch('http://example.com/api/3'),
      mock.fetch('http://example.com/api/4'),
      mock.fetch('http://example.com/api/5')
    ]

    const responses = await Promise.all(promises)
    const data = await Promise.all(responses.map(r => r.json()))

    strictEqual(data.length, 5)
    strictEqual(data[0].url, 'http://example.com/api/1')
    strictEqual(data[4].url, 'http://example.com/api/5')

    strictEqual(mock.requests.length, 5)

    mock.restore()
  })
})
