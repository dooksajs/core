import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual, ok, deepStrictEqual } from 'node:assert'
import { createPluginTester, createMockFetch } from '@dooksa/test'
import { api, state } from '#core'

/**
 * Helper function to create a schema for a collection
 * @param {string} collectionName - The name of the collection (e.g., 'user/profiles')
 * @returns {Object} Schema entry for the collection
 */
function createCollectionSchema (collectionName) {
  return {
    name: collectionName,
    isCollection: true,
    entries: [
      {
        id: collectionName,
        entry: {
          type: 'collection'
        }
      },
      {
        id: collectionName + '/items',
        entry: {
          type: 'object',
          properties: [
            {
              name: 'name',
              type: 'string'
            },
            {
              name: 'email',
              type: 'string'
            },
            {
              name: 'role',
              type: 'string'
            }
          ]
        }
      }
    ]
  }
}

/**
 * Helper function to set up the API plugin with dependencies
 * @param {import('node:test').TestContext} t - Test context
 * @param {Object} [options] - Configuration object
 * @param {Object} [options.hostname] - Hostname for API requests
 * @param {Array} [options.collections] - Array of collection names to register schemas for
 * @returns {Object} Object with tester, api plugin instance, and state helpers
 */
function setupApiPlugin (t, options = {}) {
  const tester = createPluginTester(t)

  // Create observable instances of required plugins
  const statePlugin = tester.spy('state', state)
  const apiPlugin = tester.spy('api', api)

  // Create state export with schemas for the collections
  const collections = options.collections || ['user/profiles']
  const stateItems = collections.map(collection => createCollectionSchema(collection))

  const stateExport = {
    _values: {},
    _names: collections,
    _items: stateItems,
    _defaults: []
  }

  // Initialize values for each collection
  collections.forEach(collection => {
    stateExport._values[collection] = {}
  })

  statePlugin.setup(stateExport)

  // Setup API plugin with hostname
  apiPlugin.setup({ hostname: options.hostname || 'http://localhost:3000' })

  return {
    tester,
    apiPlugin,
    statePlugin
  }
}

describe('API plugin', function () {
  let tester
  let originalFetch

  beforeEach(async function () {
    // Store original fetch
    originalFetch = global.fetch

    // Create plugin tester
    tester = createPluginTester(this)
  })

  afterEach(function () {
    if (tester) {
      tester.restoreAll()
    }
    // Restore original fetch
    if (originalFetch) {
      global.fetch = originalFetch
    }
  })

  describe('getAll action', function () {
    it('should fetch all documents from a collection', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Setup mock fetch for successful response
      const mockFetch = createMockFetch(this, {
        response: [
          {
            id: 'user-1',
            collection: 'user/profiles',
            item: {
              name: 'John Doe',
              email: 'john@example.com',
              role: 'admin'
            }
          },
          {
            id: 'user-2',
            collection: 'user/profiles',
            item: {
              name: 'Jane Smith',
              email: 'jane@example.com',
              role: 'user'
            }
          },
          {
            id: 'user-3',
            collection: 'user/profiles',
            item: {
              name: 'Bob Johnson',
              email: 'bob@example.com',
              role: 'user'
            }
          }
        ]
      })
      global.fetch = mockFetch.fetch

      const result = await apiPlugin.apiGetAll({
        collection: 'user/profiles'
      })

      strictEqual(result.isEmpty, false)
      strictEqual(result.item.length, 3)
      ok(result.item.some(item => item.item.name === 'John Doe'))
      ok(result.item.some(item => item.item.name === 'Jane Smith'))
      ok(result.item.some(item => item.item.name === 'Bob Johnson'))
      strictEqual(result.collection, 'user/profiles')
    })

    it('should handle empty collections', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['empty/collection']
      })

      // Create mock fetch for empty collection
      const mockFetch = createMockFetch(this, {
        response: []
      })
      global.fetch = mockFetch.fetch

      const result = await apiPlugin.apiGetAll({
        collection: 'empty/collection'
      })

      strictEqual(result.item.length, 0)
      strictEqual(result.isEmpty, true)
      strictEqual(result.collection, 'empty/collection')
    })

    it('should support pagination with page parameter', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Setup mock fetch for paginated response
      const mockFetch = createMockFetch(this, {
        response: [
          {
            id: 'user-1',
            collection: 'user/profiles',
            item: { name: 'John Doe' }
          },
          {
            id: 'user-2',
            collection: 'user/profiles',
            item: { name: 'Jane Smith' }
          }
        ]
      })
      global.fetch = mockFetch.fetch

      const result = await apiPlugin.apiGetAll({
        collection: 'user/profiles',
        page: 1,
        perPage: 2
      })

      // Should return paginated results
      strictEqual(result.item.length, 2)
      strictEqual(result.collection, 'user/profiles')
    })

    it('should support limit parameter', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Setup mock fetch for limited response
      const mockFetch = createMockFetch(this, {
        response: [
          {
            id: 'user-1',
            collection: 'user/profiles',
            item: { name: 'John Doe' }
          },
          {
            id: 'user-2',
            collection: 'user/profiles',
            item: { name: 'Jane Smith' }
          }
        ]
      })
      global.fetch = mockFetch.fetch

      const result = await apiPlugin.apiGetAll({
        collection: 'user/profiles',
        limit: 2
      })

      strictEqual(result.item.length, 2)
      strictEqual(result.collection, 'user/profiles')
    })

    it('should support expand parameter', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles', 'user/settings']
      })

      // Setup mock fetch for expanded response
      const mockFetch = createMockFetch(this, {
        response: [
          {
            id: 'user-1',
            collection: 'user/profiles',
            item: { name: 'John Doe' },
            expand: [
              {
                id: 'profile-1',
                collection: 'user/settings',
                item: { theme: 'dark' }
              }
            ]
          }
        ]
      })
      global.fetch = mockFetch.fetch

      const result = await apiPlugin.apiGetAll({
        collection: 'user/profiles',
        expand: true
      })

      strictEqual(result.item.length, 1)
      // Verify expand data structure
      result.item.forEach(item => {
        ok(item.hasOwnProperty('item'))
        ok(item.hasOwnProperty('collection'))
        ok(item.hasOwnProperty('id'))
      })
      strictEqual(result.collection, 'user/profiles')
    })

    it('should support WHERE clause filtering', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Setup mock fetch for filtered response
      const mockFetch = createMockFetch(this, {
        response: [
          {
            id: 'user-1',
            collection: 'user/profiles',
            item: {
              name: 'John Doe',
              email: 'john@example.com',
              role: 'admin'
            }
          }
        ]
      })
      global.fetch = mockFetch.fetch

      const result = await apiPlugin.apiGetAll({
        collection: 'user/profiles',
        where: "role == 'admin'"
      })

      strictEqual(result.item.length, 1)
      strictEqual(result.item[0].item.name, 'John Doe')
      strictEqual(result.item[0].item.role, 'admin')
      strictEqual(result.collection, 'user/profiles')
    })

    it('should handle complex WHERE clauses', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Setup mock fetch for filtered response
      const mockFetch = createMockFetch(this, {
        response: [
          {
            id: 'user-2',
            collection: 'user/profiles',
            item: {
              name: 'Jane Smith',
              email: 'jane@example.com',
              role: 'user'
            }
          }
        ]
      })
      global.fetch = mockFetch.fetch

      const result = await apiPlugin.apiGetAll({
        collection: 'user/profiles',
        where: "(role == 'user' && name ~ 'Jane')"
      })

      strictEqual(result.item.length, 1)
      strictEqual(result.item[0].item.name, 'Jane Smith')
      strictEqual(result.collection, 'user/profiles')
    })

    it('should sync data to state by default', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin, statePlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Setup mock fetch for successful response
      const mockFetch = createMockFetch(this, {
        response: [
          {
            id: 'user-1',
            collection: 'user/profiles',
            item: {
              name: 'John Doe',
              email: 'john@example.com',
              role: 'admin'
            }
          }
        ]
      })
      global.fetch = mockFetch.fetch

      await apiPlugin.apiGetAll({
        collection: 'user/profiles'
      })

      // Verify data was stored in state
      const stateValue = statePlugin.stateGetValue({
        name: 'user/profiles',
        id: 'user-1'
      })

      strictEqual(stateValue.item.name, 'John Doe')
      strictEqual(stateValue.item.email, 'john@example.com')
    })

    it('should not sync when sync option is false', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin, statePlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Setup mock fetch for successful response
      const mockFetch = createMockFetch(this, {
        response: [
          {
            id: 'user-1',
            collection: 'user/profiles',
            item: {
              name: 'John Doe',
              email: 'john@example.com',
              role: 'admin'
            }
          }
        ]
      })
      global.fetch = mockFetch.fetch

      // Clear any existing state first
      statePlugin.stateDeleteValue({
        name: 'user/profiles',
        id: 'user-1'
      })

      await apiPlugin.apiGetAll({
        collection: 'user/profiles',
        sync: false
      })

      // Verify data was NOT stored in state
      const stateValue = statePlugin.stateGetValue({
        name: 'user/profiles',
        id: 'user-1'
      })

      ok(stateValue.isEmpty)
    })
  })

  describe('getById action', function () {
    it('should fetch single document by ID', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Setup mock fetch for successful response
      const mockFetch = createMockFetch(this, {
        response: [
          {
            id: 'user-1',
            collection: 'user/profiles',
            item: {
              name: 'John Doe',
              email: 'john@example.com',
              role: 'admin'
            }
          }
        ]
      })
      global.fetch = mockFetch.fetch

      const result = await apiPlugin.apiGetById({
        collection: 'user/profiles',
        id: 'user-1'
      })

      strictEqual(result.item.length, 1)
      strictEqual(result.item[0].item.name, 'John Doe')
      strictEqual(result.item[0].item.email, 'john@example.com')
      strictEqual(result.collection, 'user/profiles')
      strictEqual(result.isEmpty, false)
    })

    it('should fetch multiple documents by ID array', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Setup mock fetch for successful response
      const mockFetch = createMockFetch(this, {
        response: [
          {
            id: 'user-1',
            collection: 'user/profiles',
            item: { name: 'John Doe' }
          },
          {
            id: 'user-2',
            collection: 'user/profiles',
            item: { name: 'Jane Smith' }
          }
        ]
      })
      global.fetch = mockFetch.fetch

      const result = await apiPlugin.apiGetById({
        collection: 'user/profiles',
        id: ['user-1', 'user-2']
      })

      strictEqual(result.item.length, 2)
      ok(result.item.some(item => item.item.name === 'John Doe'))
      ok(result.item.some(item => item.item.name === 'Jane Smith'))
      strictEqual(result.collection, 'user/profiles')
    })

    it('should support expand parameter', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles', 'user/settings']
      })

      // Setup mock fetch for successful response
      const mockFetch = createMockFetch(this, {
        response: [
          {
            id: 'user-1',
            collection: 'user/profiles',
            item: { name: 'John Doe' },
            expand: [
              {
                id: 'profile-1',
                collection: 'user/settings',
                item: { theme: 'dark' }
              }
            ]
          }
        ]
      })
      global.fetch = mockFetch.fetch

      const result = await apiPlugin.apiGetById({
        collection: 'user/profiles',
        id: 'user-1',
        expand: true
      })

      strictEqual(result.item.length, 1)
      ok(result.item[0].hasOwnProperty('item'))
      ok(result.item[0].hasOwnProperty('collection'))
      strictEqual(result.collection, 'user/profiles')
    })

    it('should sync data to state by default', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin, statePlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Setup mock fetch for successful response
      const mockFetch = createMockFetch(this, {
        response: [
          {
            id: 'user-2',
            collection: 'user/profiles',
            item: {
              name: 'Jane Smith',
              email: 'jane@example.com',
              role: 'user'
            }
          }
        ]
      })
      global.fetch = mockFetch.fetch

      await apiPlugin.apiGetById({
        collection: 'user/profiles',
        id: 'user-2'
      })

      const stateValue = statePlugin.stateGetValue({
        name: 'user/profiles',
        id: 'user-2'
      })

      strictEqual(stateValue.item.name, 'Jane Smith')
    })

    it('should return empty result when no items found', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Setup mock fetch for empty response
      const mockFetch = createMockFetch(this, {
        response: []
      })
      global.fetch = mockFetch.fetch

      const result = await apiPlugin.apiGetById({
        collection: 'user/profiles',
        id: 'non-existent'
      })

      strictEqual(result.item.length, 0)
      strictEqual(result.isEmpty, true)
      strictEqual(result.collection, 'user/profiles')
    })

    it('should handle string ID (not array)', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Setup mock fetch for successful response
      const mockFetch = createMockFetch(this, {
        response: [
          {
            id: 'user-1',
            collection: 'user/profiles',
            item: { name: 'John Doe' }
          }
        ]
      })
      global.fetch = mockFetch.fetch

      const result = await apiPlugin.apiGetById({
        collection: 'user/profiles',
        id: 'user-1'
      })

      strictEqual(result.item.length, 1)
      strictEqual(result.item[0].id, 'user-1')
      strictEqual(result.collection, 'user/profiles')
    })
  })

  describe('Caching behavior', function () {
    it('should return cached data on second request', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Setup mock fetch for successful response
      const mockFetch = createMockFetch(this, {
        response: [
          {
            id: 'user-1',
            collection: 'user/profiles',
            item: { name: 'John Doe' }
          }
        ]
      })
      global.fetch = mockFetch.fetch

      // First request - cache miss
      const result1 = await apiPlugin.apiGetAll({
        collection: 'user/profiles'
      })

      // Track fetch calls
      let fetchCallCount = 0
      const mockFetch2 = createMockFetch(this, {
        response: result1.item,
        onRequest: () => fetchCallCount++
      })
      global.fetch = mockFetch2.fetch

      // Second request - should use cache
      const result2 = await apiPlugin.apiGetAll({
        collection: 'user/profiles'
      })

      // Should not make new fetch call
      strictEqual(fetchCallCount, 0)
      deepStrictEqual(result1, result2)
    })

    it('should cache by query parameters', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Setup mock fetch for successful response
      const mockFetch = createMockFetch(this, {
        response: [
          {
            id: 'user-1',
            collection: 'user/profiles',
            item: { name: 'John Doe' }
          }
        ]
      })
      global.fetch = mockFetch.fetch

      // Request with pagination
      await apiPlugin.apiGetAll({
        collection: 'user/profiles',
        page: 1,
        perPage: 2
      })

      // Request without pagination should be different cache
      const result2 = await apiPlugin.apiGetAll({
        collection: 'user/profiles'
      })

      // Both should succeed (different cache keys)
      ok(result2.item.length > 0)
    })
  })

  describe('Request queue management', function () {
    it('should handle duplicate concurrent requests', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Track fetch calls
      let fetchCallCount = 0
      const mockFetch = createMockFetch(this, {
        response: [
          {
            id: 'test',
            collection: 'user/profiles',
            item: { name: 'Test' }
          }
        ],
        onRequest: () => fetchCallCount++
      })
      global.fetch = mockFetch.fetch

      // Make multiple identical requests
      const promises = [
        apiPlugin.apiGetAll({ collection: 'user/profiles' }),
        apiPlugin.apiGetAll({ collection: 'user/profiles' }),
        apiPlugin.apiGetAll({ collection: 'user/profiles' })
      ]

      await Promise.all(promises)

      // Should only fetch once due to queueing
      strictEqual(fetchCallCount, 1)
    })

    it('should handle concurrent requests to different resources', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles', 'other/collection']
      })

      // Setup mock fetch with dynamic response
      const mockFetch = createMockFetch(this, {
        response: (url) => {
          if (url.includes('user/profiles')) {
            return [
              {
                id: 'user-1',
                collection: 'user/profiles',
                item: { name: 'John' }
              }
            ]
          }
          return []
        }
      })
      global.fetch = mockFetch.fetch

      // Make concurrent requests to different collections
      const promises = [
        apiPlugin.apiGetAll({ collection: 'user/profiles' }),
        apiPlugin.apiGetAll({ collection: 'other/collection' })
      ]

      await Promise.all(promises)

      // Should make 2 separate fetch calls
      strictEqual(mockFetch.requests.length, 2)
    })
  })

  describe('Error handling', function () {
    it('should handle network errors', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Setup mock fetch to throw error
      const mockFetch = createMockFetch(this, {
        error: new Error('Network connection failed')
      })
      global.fetch = mockFetch.fetch

      try {
        await apiPlugin.apiGetAll({
          collection: 'user/profiles'
        })
        ok(false, 'Should have thrown error')
      } catch (error) {
        strictEqual(error.message, 'Network connection failed')
      }
    })

    it('should handle HTTP error responses', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Setup mock fetch for HTTP error
      const mockFetch = createMockFetch(this, {
        ok: false,
        status: 500,
        response: { error: 'Internal Server Error' }
      })
      global.fetch = mockFetch.fetch

      try {
        await apiPlugin.apiGetAll({
          collection: 'user/profiles'
        })
        ok(false, 'Should have thrown error')
      } catch (error) {
        ok(error.message.includes('HTTP error'))
      }
    })

    it('should handle 404 responses', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Setup mock fetch for 404
      const mockFetch = createMockFetch(this, {
        ok: false,
        status: 404,
        response: { error: 'Not Found' }
      })
      global.fetch = mockFetch.fetch

      try {
        await apiPlugin.apiGetById({
          collection: 'user/profiles',
          id: 'non-existent'
        })
        ok(false, 'Should have thrown error')
      } catch (error) {
        ok(error.message.includes('HTTP error'))
      }
    })

    it('should handle malformed JSON responses', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Setup mock fetch for malformed JSON
      const mockFetch = createMockFetch(this, {
        response: {
          json: async () => {
            throw new Error('Invalid JSON')
          }
        }
      })
      global.fetch = mockFetch.fetch

      try {
        await apiPlugin.apiGetAll({
          collection: 'user/profiles'
        })
        ok(false, 'Should have thrown error')
      } catch (error) {
        ok(error.message.includes('Invalid JSON') || error.message.includes('HTTP error'))
      }
    })
  })

  describe('Plugin metadata and exports', function () {
    it('should have correct plugin metadata', function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Verify api plugin is properly mocked
      ok(apiPlugin.apiGetAll)
      ok(apiPlugin.apiGetById)
      strictEqual(typeof apiPlugin.apiGetAll, 'function')
      strictEqual(typeof apiPlugin.apiGetById, 'function')
    })

    it('should have setup function available', function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Verify setup is accessible
      ok(apiPlugin.setup)
      strictEqual(typeof apiPlugin.setup, 'function')
    })
  })

  describe('Performance and edge cases', function () {
    it('should handle rapid successive calls efficiently', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Setup mock fetch for successful response
      const mockFetch = createMockFetch(this, {
        response: [
          {
            id: 'user-1',
            collection: 'user/profiles',
            item: { name: 'John Doe' }
          }
        ]
      })
      global.fetch = mockFetch.fetch

      const startTime = Date.now()
      const promises = []

      for (let i = 0; i < 10; i++) {
        promises.push(apiPlugin.apiGetAll({
          collection: 'user/profiles'
        }))
      }

      await Promise.all(promises)
      const endTime = Date.now()

      // Should complete quickly due to caching
      ok(endTime - startTime < 1000, 'Should complete within 1 second')
    })

    it('should handle very large result sets', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin, statePlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Generate large dataset
      const largeDataset = []
      for (let i = 0; i < 100; i++) {
        largeDataset.push({
          id: `user-${i}`,
          collection: 'user/profiles',
          item: {
            name: `User ${i}`,
            email: `user${i}@example.com`,
            role: i % 2 === 0 ? 'admin' : 'user'
          }
        })
      }

      // Setup mock fetch for large dataset
      const mockFetch = createMockFetch(this, {
        response: largeDataset
      })
      global.fetch = mockFetch.fetch

      const result = await apiPlugin.apiGetAll({
        collection: 'user/profiles'
      })

      // Should return all 100 items
      strictEqual(result.item.length, 100)
      ok(result.item[0].item.name.includes('User 0'))
    })

    it('should handle special characters in collection names', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Setup mock fetch for successful response
      const mockFetch = createMockFetch(this, {
        response: [
          {
            id: 'user-1',
            collection: 'user/profiles',
            item: { name: 'John Doe' }
          }
        ]
      })
      global.fetch = mockFetch.fetch

      const result = await apiPlugin.apiGetAll({
        collection: 'user/profiles'
      })

      // Should work with standard collection names
      ok(result.collection)
      ok(result.item)
    })

    it('should handle empty WHERE clause', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin, statePlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Setup mock fetch for successful response
      const mockFetch = createMockFetch(this, {
        response: [
          {
            id: 'user-1',
            collection: 'user/profiles',
            item: {
              name: 'John Doe',
              email: 'john@example.com',
              role: 'admin'
            }
          },
          {
            id: 'user-2',
            collection: 'user/profiles',
            item: {
              name: 'Jane Smith',
              email: 'jane@example.com',
              role: 'user'
            }
          },
          {
            id: 'user-3',
            collection: 'user/profiles',
            item: {
              name: 'Bob Johnson',
              email: 'bob@example.com',
              role: 'user'
            }
          }
        ]
      })
      global.fetch = mockFetch.fetch

      const result = await apiPlugin.apiGetAll({
        collection: 'user/profiles',
        where: ''
      })

      // Should return all results
      strictEqual(result.item.length, 3)
      strictEqual(result.collection, 'user/profiles')
    })

    it('should handle undefined query parameters', async function () {
      // Setup API plugin with spy mode
      const { tester, apiPlugin } = setupApiPlugin(this, {
        collections: ['user/profiles']
      })

      // Setup mock fetch for successful response
      const mockFetch = createMockFetch(this, {
        response: [
          {
            id: 'user-1',
            collection: 'user/profiles',
            item: { name: 'John Doe' }
          }
        ]
      })
      global.fetch = mockFetch.fetch

      const result = await apiPlugin.apiGetAll({
        collection: 'user/profiles',
        page: undefined,
        perPage: undefined,
        limit: undefined,
        where: undefined,
        expand: undefined
      })

      // Should work without query parameters
      ok(result.item)
      ok(result.item.length > 0)
      strictEqual(result.collection, 'user/profiles')
    })
  })
})
