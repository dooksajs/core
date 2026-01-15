import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual, ok, deepStrictEqual } from 'node:assert'
import { mockPlugin, createMockFetch } from '@dooksa/test'

describe('Page plugin', function () {
  let mock

  beforeEach(async function () {
    // Setup mock plugin with client modules
    mock = await mockPlugin(this, {
      name: 'page',
      platform: 'client',
      clientModules: ['component', 'state', 'route']
    })
  })

  afterEach(function () {
    if (mock) {
      mock.restore()
    }
  })

  describe('Methods', function () {
    describe('pathToId', function () {
      it('should convert path to hashed ID', function () {
        const path = '/home'
        const result = mock.client.method.pagePathToId(path)

        strictEqual(typeof result, 'string')
        ok(result.startsWith('_'))
        ok(result.endsWith('_'))
        ok(result.length > 2)
      })

      it('should produce consistent IDs for same path', function () {
        const path = '/about'
        const id1 = mock.client.method.pagePathToId(path)
        const id2 = mock.client.method.pagePathToId(path)

        strictEqual(id1, id2)
      })

      it('should produce different IDs for different paths', function () {
        const id1 = mock.client.method.pagePathToId('/home')
        const id2 = mock.client.method.pagePathToId('/about')

        strictEqual(id1 !== id2, true)
      })

      it('should handle complex paths with special characters', function () {
        const path = '/user/profile/123?tab=settings'
        const result = mock.client.method.pagePathToId(path)

        strictEqual(typeof result, 'string')
        ok(result.startsWith('_'))
        ok(result.endsWith('_'))
      })

      it('should handle root path', function () {
        const result = mock.client.method.pagePathToId('/')

        strictEqual(typeof result, 'string')
        ok(result.startsWith('_'))
        ok(result.endsWith('_'))
      })
    })

    describe('appendExpand', function () {
      it('should return early when data is empty', function () {
        const data = []

        mock.client.method.pageAppendExpand({
          collection: 'component/items',
          id: 'non-existent',
          data
        })

        strictEqual(data.length, 0)
      })

      it('should append direct data without expansion', function () {
        const data = []

        mock.client.method.stateSetValue({
          name: 'component/items',
          value: { name: 'test-component' },
          options: { id: 'comp-1' }
        })

        mock.client.method.pageAppendExpand({
          collection: 'component/items',
          id: 'comp-1',
          data,
          expand: false
        })

        strictEqual(data.length, 1)
        strictEqual(data[0].collection, 'component/items')
        strictEqual(data[0].id, 'comp-1')
        deepStrictEqual(data[0].item, { name: 'test-component' })
      })

      it('should append expanded relationships', function () {
        const data = []

        mock.client.method.stateSetValue({
          name: 'component/items',
          value: { name: 'parent' },
          options: { id: 'parent-1' }
        })

        const originalStateGetValue = mock.client.method.stateGetValue
        mock.client.method.stateGetValue.mock.mockImplementation((params) => {
          if (params.name === 'component/items' && params.id === 'parent-1') {
            return {
              isEmpty: false,
              id: 'parent-1',
              item: { name: 'parent' },
              metadata: {},
              expand: [
                {
                  collection: 'component/children',
                  id: 'child-1',
                  item: { name: 'child' }
                }
              ],
              isExpandEmpty: false
            }
          }
          return { isEmpty: true }
        })

        mock.client.method.pageAppendExpand({
          collection: 'component/items',
          id: 'parent-1',
          data,
          expand: true
        })

        strictEqual(data.length, 2)
        strictEqual(data[0].id, 'parent-1')
        strictEqual(data[1].id, 'child-1')
      })

      it('should return early when expand is empty', function () {
        const data = []

        const originalStateGetValue = mock.client.method.stateGetValue
        mock.client.method.stateGetValue.mock.mockImplementation((params) => {
          if (params.name === 'page/items' && params.id === 'page-1') {
            return {
              isEmpty: false,
              id: 'page-1',
              item: { name: 'page' },
              metadata: {},
              expand: [],
              isExpandEmpty: true
            }
          }
          return { isEmpty: true }
        })

        mock.client.method.pageAppendExpand({
          collection: 'page/items',
          id: 'page-1',
          data,
          expand: true
        })

        strictEqual(data.length, 1)
        strictEqual(data[0].id, 'page-1')
      })
    })

    describe('getItemsById', function () {
      it('should return empty result when page does not exist', function () {
        const result = mock.client.method.pageGetItemsById('non-existent')

        strictEqual(result.isEmpty, true)
        ok(!result.item)
      })

      it('should return page with empty items', function () {
        const originalStateGetValue = mock.client.method.stateGetValue
        mock.client.method.stateGetValue.mock.mockImplementation((params) => {
          if (params.name === 'page/items' && params.id === 'page-1') {
            return {
              isEmpty: false,
              id: 'page-1',
              item: [],
              metadata: {},
              expand: [],
              expandIncluded: {},
              isExpandEmpty: true
            }
          }
          return { isEmpty: true }
        })

        const result = mock.client.method.pageGetItemsById('page-1')

        strictEqual(result.isEmpty, false)
        ok(Array.isArray(result.item))
        strictEqual(result.item.length, 1)
      })

      it('should retrieve page with component items', function () {
        const originalStateGetValue = mock.client.method.stateGetValue
        mock.client.method.stateGetValue.mock.mockImplementation((params) => {
          if (params.name === 'page/items' && params.id === 'page-1') {
            return {
              isEmpty: false,
              id: 'page-1',
              item: ['comp-1', 'comp-2'],
              metadata: {},
              expand: [
                {
                  collection: 'component/items',
                  id: 'comp-1',
                  item: { name: 'Component 1' }
                },
                {
                  collection: 'component/items',
                  id: 'comp-2',
                  item: { name: 'Component 2' }
                }
              ],
              expandIncluded: {},
              isExpandEmpty: false
            }
          }
          if (params.name === 'component/children') {
            return { isEmpty: true }
          }
          return { isEmpty: true }
        })

        const result = mock.client.method.pageGetItemsById('page-1')

        strictEqual(result.isEmpty, false)
        strictEqual(result.item.length, 3)
        strictEqual(result.item[0].collection, 'page/items')
        strictEqual(result.item[1].collection, 'component/items')
        strictEqual(result.item[2].collection, 'component/items')
      })

      it('should handle circular references prevention', function () {
        const originalStateGetValue = mock.client.method.stateGetValue
        mock.client.method.stateGetValue.mock.mockImplementation((params) => {
          if (params.name === 'page/items' && params.id === 'page-1') {
            return {
              isEmpty: false,
              id: 'page-1',
              item: ['comp-a'],
              metadata: {},
              expand: [
                {
                  collection: 'component/items',
                  id: 'comp-a',
                  item: { name: 'Component A' }
                }
              ],
              expandIncluded: {},
              isExpandEmpty: false
            }
          }
          if (params.name === 'component/children') {
            return { isEmpty: true }
          }
          return { isEmpty: true }
        })

        const result = mock.client.method.pageGetItemsById('page-1')

        strictEqual(result.isEmpty, false)
        ok(Array.isArray(result.item))
      })
    })
  })

  describe('Actions', function () {
    describe('save', function () {
      it('should save page data to server', async function () {
        const originalStateGetValue = mock.client.method.stateGetValue
        mock.client.method.stateGetValue.mock.mockImplementation((params) => {
          if (params.name === 'page/items' && params.id === 'page-1') {
            return {
              isEmpty: false,
              id: 'page-1',
              item: ['comp-1'],
              metadata: {},
              expand: [
                {
                  collection: 'component/items',
                  id: 'comp-1',
                  item: { name: 'Component 1' }
                }
              ],
              expandIncluded: {},
              isExpandEmpty: false
            }
          }
          if (params.name === 'component/children') {
            return { isEmpty: true }
          }
          return { isEmpty: true }
        })

        const mockFetch = createMockFetch(this, {
          response: {
            success: true,
            id: 'saved-page-1'
          }
        })
        global.fetch = mockFetch.fetch

        await mock.client.method.pageSave('page-1')

        strictEqual(mockFetch.fetch.mock.calls.length, 1)
        const fetchCall = mockFetch.fetch.mock.calls[0]
        strictEqual(fetchCall.arguments[0], 'http://localhost:3000/')
        strictEqual(fetchCall.arguments[1].method, 'POST')

        const body = JSON.parse(fetchCall.arguments[1].body)
        ok(Array.isArray(body))
        strictEqual(body.length, 2)
      })

      it('should return early when page is empty', async function () {
        mock.client.method.stateGetValue.mock.mockImplementation(() => ({
          isEmpty: true
        }))

        const mockFetch = createMockFetch(this, {
          response: { success: true }
        })
        global.fetch = mockFetch.fetch

        const result = await mock.client.method.pageSave('non-existent')

        strictEqual(result, undefined)
        strictEqual(mockFetch.fetch.mock.calls.length, 0)
      })

      it('should handle fetch errors gracefully', async function () {
        const originalStateGetValue = mock.client.method.stateGetValue
        mock.client.method.stateGetValue.mock.mockImplementation((params) => {
          if (params.name === 'page/items' && params.id === 'page-1') {
            return {
              isEmpty: false,
              id: 'page-1',
              item: [],
              metadata: {},
              expand: [],
              expandIncluded: {},
              isExpandEmpty: true
            }
          }
          return { isEmpty: true }
        })

        const mockFetch = createMockFetch(this, {
          error: new Error('Network failure')
        })
        global.fetch = mockFetch.fetch

        await mock.client.method.pageSave('page-1')

        strictEqual(mockFetch.fetch.mock.calls.length, 1)
      })

      it('should handle non-201 HTTP responses', async function () {
        const originalStateGetValue = mock.client.method.stateGetValue
        mock.client.method.stateGetValue.mock.mockImplementation((params) => {
          if (params.name === 'page/items' && params.id === 'page-1') {
            return {
              isEmpty: false,
              id: 'page-1',
              item: [],
              metadata: {},
              expand: [],
              expandIncluded: {},
              isExpandEmpty: true
            }
          }
          return { isEmpty: true }
        })

        const mockFetch = createMockFetch(this, {
          ok: false,
          status: 500,
          response: { error: 'Server error' }
        })
        global.fetch = mockFetch.fetch

        await mock.client.method.pageSave('page-1')

        strictEqual(mockFetch.fetch.mock.calls.length, 1)
      })
    })

    describe('getItemsByPath', function () {
      it('should retrieve page items by path', function () {
        const path = '/home'
        const pathId = mock.client.method.pagePathToId(path)

        mock.client.method.stateSetValue({
          name: 'page/paths',
          value: {
            name: 'Home Page',
            itemId: 'home-page-1'
          },
          options: { id: pathId }
        })

        const originalStateGetValue = mock.client.method.stateGetValue
        mock.client.method.stateGetValue.mock.mockImplementation((params) => {
          if (params.name === 'page/paths' && params.id === pathId) {
            return {
              isEmpty: false,
              item: {
                name: 'Home Page',
                itemId: 'home-page-1'
              }
            }
          }
          if (params.name === 'page/items' && params.id === 'home-page-1') {
            return {
              isEmpty: false,
              id: 'home-page-1',
              item: ['comp-1'],
              metadata: {},
              expand: [
                {
                  collection: 'component/items',
                  id: 'comp-1',
                  item: { name: 'Home Component' }
                }
              ],
              expandIncluded: {},
              isExpandEmpty: false
            }
          }
          if (params.name === 'component/children') {
            return { isEmpty: true }
          }
          return { isEmpty: true }
        })

        const result = mock.client.method.pageGetItemsByPath(path)

        strictEqual(result.isEmpty, false)
        // Should have page data + component + path info
        strictEqual(result.item.length, 3)
        // Check that we have the expected collections
        const collections = result.item.map(item => item.collection)
        ok(collections.includes('page/items'))
        ok(collections.includes('component/items'))
        // The last item should be the path info (which may not have collection property)
        // but should have the path data
        const lastItem = result.item[result.item.length - 1]
        ok(lastItem.item || lastItem.id) // Should have some data
      })


      it('should return empty when path and redirect not found', function () {
        const path = '/unknown'
        const pathId = mock.client.method.pagePathToId(path)

        const originalStateGetValue = mock.client.method.stateGetValue
        mock.client.method.stateGetValue.mock.mockImplementation((params) => {
          if (params.name === 'page/paths' && params.id === pathId) {
            return { isEmpty: true }
          }
          if (params.name === 'page/redirects' && params.id === pathId) {
            return { isEmpty: true }
          }
          return { isEmpty: true }
        })

        const result = mock.client.method.pageGetItemsByPath(path)

        strictEqual(result.isEmpty, true)
        ok(!result.item)
      })
    })
  })

  describe('Setup function', function () {
    it('should handle 404 (empty page path)', function () {
      // Mock routeCurrentId to return path that doesn't exist
      const pathId = mock.client.method.pagePathToId('/non-existent')
      const originalRouteCurrentId = mock.client.method.routeCurrentId

      // Mock window for route plugin
      global.window = {
        location: {
          pathname: '/non-existent',
          href: 'http://localhost/non-existent',
          protocol: 'http:',
          host: 'localhost',
          hostname: 'localhost',
          port: '',
          search: '',
          hash: '',
          origin: 'http://localhost',
          ancestorOrigins: {
            length: 0,
            contains: () => false,
            item: () => null,
            [Symbol.iterator]: function* () {

            }
          },
          assign: () => {
          },
          reload: () => {
          },
          replace: () => {
          }
        }
      }

      mock.client.method.routeCurrentId = () => pathId

      const originalStateGetValue = mock.client.method.stateGetValue
      mock.client.method.stateGetValue.mock.mockImplementation((params) => {
        if (params.name === 'page/paths' && params.id === pathId) {
          return { isEmpty: true }
        }
        return { isEmpty: true }
      })

      // Should not throw
      mock.client.setup.page()

      // Restore
      mock.client.method.routeCurrentId = originalRouteCurrentId
      delete global.window
    })
  })

  describe('Plugin metadata', function () {
    it('should export all expected functions', function () {
      ok(mock.client.method.pageAppendExpand)
      ok(mock.client.method.pageSave)
      ok(mock.client.method.pagePathToId)
      ok(mock.client.method.pageGetItemsById)
      ok(mock.client.method.pageGetItemsByPath)

      strictEqual(typeof mock.client.method.pageAppendExpand, 'function')
      strictEqual(typeof mock.client.method.pageSave, 'function')
      strictEqual(typeof mock.client.method.pagePathToId, 'function')
      strictEqual(typeof mock.client.method.pageGetItemsById, 'function')
      strictEqual(typeof mock.client.method.pageGetItemsByPath, 'function')
    })

    it('should have setup function available', function () {
      ok(mock.client.setup.page)
      strictEqual(typeof mock.client.setup.page, 'function')
    })

    it('should have correct metadata', function () {
      ok(mock.client)
      ok(mock.client.schema.page)
      ok(mock.client.schema.page.id)
      ok(mock.client.schema.page.events)
      ok(mock.client.schema.page.redirects)
      ok(mock.client.schema.page.paths)
      ok(mock.client.schema.page.items)
    })
  })

  describe('Integration scenarios', function () {
    it('should handle complete workflow: path -> page -> components -> save', async function () {
      const path = '/dashboard'
      const pathId = mock.client.method.pagePathToId(path)

      mock.client.method.stateSetValue({
        name: 'page/paths',
        value: {
          name: 'Dashboard',
          itemId: 'dashboard-1'
        },
        options: { id: pathId }
      })

      const originalStateGetValue = mock.client.method.stateGetValue
      mock.client.method.stateGetValue.mock.mockImplementation((params) => {
        if (params.name === 'page/paths' && params.id === pathId) {
          return {
            isEmpty: false,
            item: {
              name: 'Dashboard',
              itemId: 'dashboard-1'
            }
          }
        }
        if (params.name === 'page/items' && params.id === 'dashboard-1') {
          return {
            isEmpty: false,
            id: 'dashboard-1',
            item: ['header', 'content', 'footer'],
            metadata: {},
            expand: [
              {
                collection: 'component/items',
                id: 'header',
                item: {
                  name: 'Header',
                  type: 'header'
                }
              },
              {
                collection: 'component/items',
                id: 'content',
                item: {
                  name: 'Content',
                  type: 'main'
                }
              },
              {
                collection: 'component/items',
                id: 'footer',
                item: {
                  name: 'Footer',
                  type: 'footer'
                }
              }
            ],
            expandIncluded: {},
            isExpandEmpty: false
          }
        }
        if (params.name === 'component/children') {
          return { isEmpty: true }
        }
        return { isEmpty: true }
      })

      const pageData = mock.client.method.pageGetItemsByPath(path)

      strictEqual(pageData.isEmpty, false)
      strictEqual(pageData.item.length, 5)

      const mockFetch = createMockFetch(this, {
        response: {
          success: true,
          id: 'saved-dashboard'
        }
      })
      global.fetch = mockFetch.fetch

      await mock.client.method.pageSave('dashboard-1')

      strictEqual(mockFetch.fetch.mock.calls.length, 1)
      const body = JSON.parse(mockFetch.fetch.mock.calls[0].arguments[1].body)
      strictEqual(body.length, 4)
    })

  })
})
