import { it, afterEach, describe, after, mock } from 'node:test'
import { ok, strictEqual, deepStrictEqual } from 'node:assert'
import { mockStateData } from '@dooksa/test'
import { api, state } from '#core'
import { createPlugin } from '@dooksa/create-plugin'
import createTestServer from '../fixtures/test-server.js'
import userProfile from '../fixtures/plugins/user-profile.js'
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
    it('should fetch all documents from a collection', { skip: true }, async function (t) {
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

    it('should support pagination with page parameter', { skip: true }, async function (t) {
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

    it('should support limit parameter', { skip: false }, async function (t) {
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
})
