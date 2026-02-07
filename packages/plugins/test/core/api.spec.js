import { it, afterEach, describe, after, mock } from 'node:test'
import { ok, strictEqual, deepStrictEqual } from 'node:assert'
import { mockStateData } from '@dooksa/test'
import { api, state } from '#core'
import createTestServer from '../fixtures/test-server.js'
import userProfile from '../fixtures/plugins/user-profile.js'
import otherPlugin from '../fixtures/plugins/other-plugin.js'
import specialPlugin from '../fixtures/plugins/special-plugin.js'

/**
 * Helper function to set up the API plugin with dependencies
 * @param {Object[]} [plugins] - Hostname for API requests
 * @returns {Object} Object with tester, api plugin instance, and state helpers
 */
function createStateData (plugins = []) {
  if (!plugins.length) {
    plugins.push(userProfile)
  }

  const stateExport = mockStateData(plugins)

  return stateExport
}

describe('API plugin', function () {
  const testServer = createTestServer()

  after(async () => {
    // stop server
    await testServer.stop()
  })

  afterEach(async () => {
    await testServer.restore()
    // Clean up local client state
    state.restore()
    api.restore()
  })

  describe('getAll action', function () {
    it('should fetch all documents from a collection', async function (t) {
      const hostname = await testServer.start({
        data: [
          {
            name: 'user/profiles',
            value: {
              'user-1': { name: 'John Doe' },
              'user-2': { name: 'Jane Smith' },
              'user-3': { name: 'Bob Johnson' }
            }
          }
        ]
      })

      const stateData = createStateData()
      // setup plugins
      api.setup({ hostname })
      state.setup(stateData)

      const result = await api.apiGetAll({
        collection: 'user/profiles'
      })

      strictEqual(result.isEmpty, false)
      strictEqual(result.item.length, 3)
      ok(result.item.some(item => item.item.name === 'John Doe'))
      ok(result.item.some(item => item.item.name === 'Jane Smith'))
      ok(result.item.some(item => item.item.name === 'Bob Johnson'))
      strictEqual(result.collection, 'user/profiles')
    })

    it('should handle empty collections', async function (t) {
      const hostname = await testServer.start()

      const stateData = createStateData()
      // setup plugins
      api.setup({ hostname })
      state.setup(stateData)

      const result = await api.apiGetAll({
        collection: 'user/profiles'
      })

      strictEqual(result.item.length, 0)
      strictEqual(result.isEmpty, true)
      strictEqual(result.collection, 'user/profiles')
    })

    it('should support pagination with page parameter', async function (t) {
      const hostname = await testServer.start({
        data: [
          {
            name: 'user/profiles',
            value: {
              'user-1': { name: 'John Doe' },
              'user-2': { name: 'Jane Smith' },
              'user-3': { name: 'Bob Johnson' }
            }
          }
        ]
      })

      const stateData = createStateData()
      // setup plugins
      api.setup({ hostname })
      state.setup(stateData)

      const result = await api.apiGetAll({
        collection: 'user/profiles',
        page: 1,
        perPage: 2
      })

      // Should return paginated results
      strictEqual(result.item.length, 2)
      strictEqual(result.collection, 'user/profiles')
    })

    it('should support limit parameter', async function (t) {
      const hostname = await testServer.start({
        data: [
          {
            name: 'user/profiles',
            value: {
              'user-1': { name: 'John Doe' },
              'user-2': { name: 'Jane Smith' },
              'user-3': { name: 'Bob Johnson' }
            }
          }
        ]
      })

      const stateData = createStateData()
      // setup plugins
      api.setup({ hostname })
      state.setup(stateData)


      const result = await api.apiGetAll({
        collection: 'user/profiles',
        limit: 2
      })

      strictEqual(result.item.length, 2)
      strictEqual(result.collection, 'user/profiles')
    })

    it('should support expand parameter', async function (t) {
      const hostname = await testServer.start({
        data: [
          {
            name: 'user/settings',
            value: {
              'settings-1': {
                theme: 'Dark'
              }
            }
          },
          {
            name: 'user/profiles',
            value: {
              'user-1': {
                name: 'John Doe',
                settings: 'settings-1'
              }
            }
          }
        ]
      })

      const stateData = createStateData()
      // setup plugins
      api.setup({ hostname })
      state.setup(stateData)

      const result = await api.apiGetAll({
        collection: 'user/profiles',
        expand: true
      })

      strictEqual(result.item.length, 1)
      // Verify expand data structure
      result.item.forEach(item => {
        ok(!item.isExpandEmpty)
        strictEqual(item.expand.length, 1)

        item.expand.forEach(expandedItem => {
          strictEqual(expandedItem.collection, 'user/settings')
          strictEqual(expandedItem.item.theme, 'Dark')
        })
      })
      strictEqual(result.collection, 'user/profiles')
    })

    it('should support WHERE clause filtering', async function (t) {
      const hostname = await testServer.start({
        routes: ['user/profiles'],
        data: [
          {
            name: 'user/profiles',
            value: {
              'user-1': {
                name: 'John Doe',
                email: 'john@example.com',
                role: 'admin'
              },
              'user-2': {
                name: 'Jane Smith',
                email: 'jane@example.com',
                role: 'user'
              },
              'user-3': { name: 'Bob Johnson' }
            }
          }
        ]
      })

      const stateData = createStateData()
      // setup plugins
      api.setup({ hostname })
      state.setup(stateData)

      const result = await api.apiGetAll({
        collection: 'user/profiles',
        where: "role == 'admin'"
      })

      strictEqual(result.item.length, 1)
      strictEqual(result.item[0].item.name, 'John Doe')
      strictEqual(result.item[0].item.role, 'admin')
      strictEqual(result.collection, 'user/profiles')
    })

    it('should handle complex WHERE clauses', async function (t) {
      const hostname = await testServer.start({
        routes: ['user/profiles'],
        data: [
          {
            name: 'user/profiles',
            value: {
              'user-1': {
                name: 'John Doe',
                email: 'john@example.com',
                role: 'user'
              },
              'user-2': {
                name: 'Jane Smith',
                email: 'jane@example.com',
                role: 'user'
              },
              'user-3': { name: 'Bob Johnson' }
            }
          }
        ]
      })

      const stateData = createStateData()
      // setup plugins
      api.setup({ hostname })
      state.setup(stateData)

      const result = await api.apiGetAll({
        collection: 'user/profiles',
        where: "(role == 'user' && name ~ 'Jane')"
      })

      strictEqual(result.item.length, 1)
      strictEqual(result.item[0].item.name, 'Jane Smith')
      strictEqual(result.collection, 'user/profiles')
    })

    it('should sync data to state by default', async function (t) {
      const hostname = await testServer.start({
        routes: ['user/profiles'],
        data: [
          {
            name: 'user/profiles',
            value: {
              'user-1': {
                name: 'John Doe',
                email: 'john@example.com',
                role: 'admin'
              }
            }
          }
        ]
      })

      const stateData = createStateData()
      // setup plugins
      api.setup({ hostname })
      state.setup(stateData)

      await api.apiGetAll({
        collection: 'user/profiles'
      })

      // Verify data was stored in state
      const stateValue = state.stateGetValue({
        name: 'user/profiles',
        id: 'user-1'
      })

      strictEqual(stateValue.item.name, 'John Doe')
      strictEqual(stateValue.item.email, 'john@example.com')
    })

    it('should not sync when sync option is false', async function (t) {
      const hostname = await testServer.start({
        routes: ['user/profiles'],
        data: [
          {
            name: 'user/profiles',
            value: {
              'user-1': {
                name: 'John Doe',
                email: 'john@example.com',
                role: 'admin'
              }
            }
          }
        ]
      })

      const stateData = createStateData()

      // setup plugins
      api.setup({ hostname })
      state.setup(stateData)

      // clear state
      state.stateDeleteValue({
        name: 'user/profiles',
        id: 'user-1'
      })

      // fetch data and do not sync with state
      const result = await api.apiGetAll({
        collection: 'user/profiles',
        sync: false
      })

      // Verify data was NOT stored in state
      const stateValue = state.stateGetValue({
        name: 'user/profiles',
        id: 'user-1'
      })

      ok(stateValue.isEmpty)
    })
  })

  describe('getById action', function () {
    it('should fetch single document by ID', async function (t) {
      const hostname = await testServer.start({
        routes: ['user/profiles'],
        data: [
          {
            name: 'user/profiles',
            value: {
              'user-1': {
                name: 'John Doe',
                email: 'john@example.com',
                role: 'admin'
              },
              'user-2': {
                name: 'Jane Smith',
                email: 'jane@example.com',
                role: 'user'
              },
              'user-3': { name: 'Bob Johnson' }
            }
          }
        ]
      })

      const stateData = createStateData()
      // setup plugins
      api.setup({ hostname })
      state.setup(stateData)

      const result = await api.apiGetById({
        collection: 'user/profiles',
        id: 'user-1'
      })

      strictEqual(result.item.length, 1)
      strictEqual(result.item[0].item.name, 'John Doe')
      strictEqual(result.item[0].item.email, 'john@example.com')
      strictEqual(result.item[0].item.role, 'admin')
      strictEqual(result.collection, 'user/profiles')
      strictEqual(result.isEmpty, false)
    })

    it('should fetch multiple documents by ID array', async function (t) {
      const hostname = await testServer.start({
        routes: ['user/profiles'],
        data: [
          {
            name: 'user/profiles',
            value: {
              'user-1': { name: 'John Doe' },
              'user-2': { name: 'Jane Smith' },
              'user-3': { name: 'Bob Johnson' }
            }
          }
        ]
      })

      const stateData = createStateData()
      // setup plugins
      api.setup({ hostname })
      state.setup(stateData)

      const result = await api.apiGetById({
        collection: 'user/profiles',
        id: ['user-1', 'user-2']
      })

      strictEqual(result.item.length, 2)
      ok(result.item.some(item => item.item.name === 'John Doe'))
      ok(result.item.some(item => item.item.name === 'Jane Smith'))
      strictEqual(result.collection, 'user/profiles')
    })

    it('should support expand parameter', async function (t) {
      const hostname = await testServer.start({
        data: [
          {
            name: 'user/settings',
            value: {
              'settings-1': {
                theme: 'Dark'
              }
            }
          },
          {
            name: 'user/profiles',
            value: {
              'user-1': {
                name: 'John Doe',
                settings: 'settings-1'
              }
            }
          }
        ]
      })

      const stateData = createStateData()
      // setup plugins
      api.setup({ hostname })
      state.setup(stateData)

      const result = await api.apiGetById({
        collection: 'user/profiles',
        id: 'user-1',
        expand: true
      })

      strictEqual(result.item.length, 1)
      strictEqual(result.collection, 'user/profiles')
      strictEqual(result.item[0].expand.length, 1)
      strictEqual(result.item[0].expand.length, 1)
      strictEqual(result.item[0].expand[0].collection, 'user/settings')
      strictEqual(result.item[0].expand[0].item.theme, 'Dark')
    })

    it('should return empty result when no items found', async function (t) {
      const hostname = await testServer.start({
        routes: ['user/profiles']
      })

      const stateData = createStateData()
      // setup plugins
      api.setup({ hostname })
      state.setup(stateData)

      const result = await api.apiGetById({
        collection: 'user/profiles',
        id: 'non-existent'
      })

      strictEqual(result.item.length, 0)
      strictEqual(result.isEmpty, true)
      strictEqual(result.collection, 'user/profiles')
    })
  })

  describe('Caching behavior', function () {
    it('should return cached data on second request', async function (t) {
      const hostname = await testServer.start({
        routes: ['user/profiles'],
        data: [
          {
            name: 'user/profiles',
            value: {
              'user-1': { name: 'John Doe' }
            }
          }
        ]
      })

      const stateData = createStateData()
      // setup plugins
      api.setup({ hostname })
      state.setup(stateData)

      // Spy on fetch
      const originalFetch = global.fetch
      const fetchSpy = mock.fn(originalFetch)
      global.fetch = fetchSpy
      t.after(() => {
        global.fetch = originalFetch
      })

      // First request - cache miss
      const result1 = await api.apiGetAll({
        collection: 'user/profiles'
      })

      // Second request - should use cache
      const result2 = await api.apiGetAll({
        collection: 'user/profiles'
      })

      // Should verify calls
      strictEqual(fetchSpy.mock.callCount(), 1)
      deepStrictEqual(result1, result2)
    })

    it('should cache by query parameters', async function (t) {
      const hostname = await testServer.start({
        routes: ['user/profiles'],
        data: [
          {
            name: 'user/profiles',
            value: {
              'user-1': { name: 'John Doe' },
              'user-2': { name: 'Jane Smith' },
              'user-3': { name: 'Bob Johnson' }
            }
          }
        ]
      })

      const stateData = createStateData()
      // setup plugins
      api.setup({ hostname })
      state.setup(stateData)

      // Spy on fetch
      const originalFetch = global.fetch
      const fetchSpy = mock.fn(originalFetch)
      global.fetch = fetchSpy
      t.after(() => {
        global.fetch = originalFetch
      })

      // Request with pagination
      await api.apiGetAll({
        collection: 'user/profiles',
        page: 1,
        perPage: 2
      })

      // Request without pagination should be different cache
      const result2 = await api.apiGetAll({
        collection: 'user/profiles'
      })

      // Both should succeed (different cache keys)
      ok(result2.item.length > 0)
      strictEqual(fetchSpy.mock.callCount(), 2)
    })
  })

  describe('Request queue management', function () {
    it('should handle duplicate concurrent requests', async function (t) {
      const hostname = await testServer.start({
        routes: ['user/profiles'],
        data: [
          {
            name: 'user/profiles',
            value: {
              'user-1': { name: 'John Doe' }
            }
          }
        ]
      })

      const stateData = createStateData()
      // setup plugins
      api.setup({ hostname })
      state.setup(stateData)

      // Spy on fetch
      const originalFetch = global.fetch
      const fetchSpy = mock.fn(originalFetch)
      global.fetch = fetchSpy
      t.after(() => {
        global.fetch = originalFetch
      })

      // Make multiple identical requests
      const promises = [
        api.apiGetAll({ collection: 'user/profiles' }),
        api.apiGetAll({ collection: 'user/profiles' }),
        api.apiGetAll({ collection: 'user/profiles' })
      ]

      await Promise.all(promises)

      // Should only fetch once due to queueing
      strictEqual(fetchSpy.mock.callCount(), 1)
    })

    it('should handle concurrent requests to different resources', async function (t) {
      const hostname = await testServer.start({
        routes: ['user/profiles', 'other/collection'],
        plugins: [
          {
            type: 'fixture',
            name: 'user-profile.js'
          },
          {
            type: 'fixture',
            name: 'other-plugin.js'
          }
        ],
        data: [
          {
            name: 'user/profiles',
            value: {
              'user-1': { name: 'John Doe' }
            }
          },
          {
            name: 'other/collection',
            value: {
              'other-1': { name: 'Other' }
            }
          }
        ]
      })

      const stateData = createStateData([userProfile, otherPlugin])
      // setup plugins
      api.setup({ hostname })
      state.setup(stateData)

      // Spy on fetch
      const originalFetch = global.fetch
      const fetchSpy = mock.fn(originalFetch)
      global.fetch = fetchSpy
      t.after(() => {
        global.fetch = originalFetch
      })

      // Make concurrent requests to different collections
      const promises = [
        api.apiGetAll({ collection: 'user/profiles' }),
        api.apiGetAll({ collection: 'other/collection' })
      ]

      await Promise.all(promises)

      // Should make 2 separate fetch calls
      strictEqual(fetchSpy.mock.callCount(), 2)
    })
  })

  describe('Error handling', function () {
    it('should handle network errors', async function (t) {
      // Start server to ensure worker is in valid state for restore
      await testServer.start({ routes: [] })

      // Setup API plugin with invalid hostname
      api.setup({ hostname: 'http://localhost:9999' })
      const stateData = createStateData()
      state.setup(stateData)

      try {
        await api.apiGetAll({
          collection: 'user/profiles'
        })
        ok(false, 'Should have thrown error')
      } catch (error) {
        ok(error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED'))
      }
    })

    it('should handle 404 responses', async function (t) {
      const hostname = await testServer.start({
        routes: ['user/profiles']
      })

      const stateData = createStateData()
      // setup plugins
      api.setup({ hostname })
      state.setup(stateData)

      try {
        await api.apiGetById({
          collection: 'non-existent',
          id: 'user-1'
        })
        ok(false, 'Should have thrown error')
      } catch (error) {
        ok(error.message.includes('HTTP error! status: 404'))
      }
    })
  })

  describe('Performance and edge cases', function () {
    it('should handle very large result sets', async function (t) {
      // Generate large dataset
      const data = []
      const profiles = {}

      for (let i = 0; i < 100; i++) {
        profiles[`user-${i}`] = {
          name: `User ${i}`,
          email: `user${i}@example.com`,
          role: i % 2 === 0 ? 'admin' : 'user'
        }
      }

      data.push({
        name: 'user/profiles',
        value: profiles
      })

      const hostname = await testServer.start({
        routes: ['user/profiles'],
        data
      })

      const stateData = createStateData()
      // setup plugins
      api.setup({ hostname })
      state.setup(stateData)

      const result = await api.apiGetAll({
        collection: 'user/profiles'
      })

      // Should return all 100 items
      strictEqual(result.item.length, 100)
      ok(result.item.some(item => item.item.name === 'User 0'))
      ok(result.item.some(item => item.item.name === 'User 99'))
    })

    it('should handle special characters in collection names', async function (t) {
      const collectionName = 'c_at_ll-ect_ion'
      const fullCollectionName = `special/${collectionName}`

      const hostname = await testServer.start({
        routes: [fullCollectionName],
        plugins: [
          {
            type: 'fixture',
            name: 'special-plugin.js'
          }
        ],
        data: [
          {
            name: fullCollectionName,
            value: {
              'item-1': { name: 'Special' }
            }
          }
        ]
      })

      const stateData = createStateData([specialPlugin])
      // setup plugins
      api.setup({ hostname })
      state.setup(stateData)

      const result = await api.apiGetAll({
        collection: fullCollectionName
      })

      strictEqual(result.item.length, 1)
      strictEqual(result.collection, fullCollectionName)
      strictEqual(result.item[0].item.name, 'Special')
    })

    it('should handle empty/undefined query parameters', async function (t) {
      const hostname = await testServer.start({
        routes: ['user/profiles'],
        data: [
          {
            name: 'user/profiles',
            value: {
              'user-1': { name: 'John Doe' }
            }
          }
        ]
      })

      const stateData = createStateData()
      // setup plugins
      api.setup({ hostname })
      state.setup(stateData)

      const result = await api.apiGetAll({
        collection: 'user/profiles',
        page: undefined,
        perPage: undefined,
        limit: undefined,
        where: undefined,
        expand: undefined
      })

      // Should work without query parameters
      strictEqual(result.item.length, 1)
      strictEqual(result.collection, 'user/profiles')
    })
  })
})
