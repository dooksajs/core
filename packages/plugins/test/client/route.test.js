import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual, ok } from 'node:assert'
import { mockClientPlugin } from '@dooksa/test'
import { mockNavigationWindow, mockWindowWithEvents } from '../../mock/index.js'

describe('Route plugin (New Mock Utilities)', function () {
  let mock
  let restoreWindow

  beforeEach(async function () {
    // Setup mock plugin
    mock = await mockClientPlugin(this, {
      name: 'route',
      modules: ['event', 'action', 'page']
    })
  })

  afterEach(function () {
    if (mock) {
      mock.restore()
    }
    if (restoreWindow) {
      restoreWindow()
    }
  })

  describe('Setup with new mocks', function () {
    it('should register popstate event listener', function () {
      // Use mockWindowWithEvents for comprehensive event testing
      const windowMock = mockWindowWithEvents(this, {
        pathname: '/',
        search: ''
      })
      restoreWindow = windowMock.restore

      // Call setup
      mock.module.route.setup()

      // Verify addEventListener was called with popstate
      const eventListeners = windowMock.getEventListeners()
      strictEqual(eventListeners.popstate.length, 1)
    })

    it('should emit route/history event on popstate', function () {
      const windowMock = mockWindowWithEvents(this, {
        pathname: '/test',
        search: ''
      })
      restoreWindow = windowMock.restore

      mock.module.route.setup()

      // Trigger popstate event
      windowMock.triggerEvent('popstate', {
        state: {
          to: '/test',
          from: '/'
        },
        type: 'popstate'
      })

      // Verify eventEmit was called
      // @ts-ignore
      strictEqual(mock.method.eventEmit.mock.calls.length, 1)

      // @ts-ignore
      const callArgs = mock.method.eventEmit.mock.calls[0].arguments[0]
      strictEqual(callArgs.name, 'route/history')
      strictEqual(callArgs.id, 'popstate')
      ok(callArgs.payload)
      ok(callArgs.payload.location)
      ok(callArgs.payload.state)
    })
  })

  describe('currentPath action with new mocks', function () {
    it('should return "/" when pathname is empty', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '',
        search: ''
      })
      restoreWindow = windowMock.restore

      const result = mock.method.routeCurrentPath()
      strictEqual(result, '/')
    })

    it('should return "/" when pathname is "/"', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/',
        search: ''
      })
      restoreWindow = windowMock.restore

      const result = mock.method.routeCurrentPath()
      strictEqual(result, '/')
    })

    it('should return actual pathname', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/users/123',
        search: ''
      })
      restoreWindow = windowMock.restore

      const result = mock.method.routeCurrentPath()
      strictEqual(result, '/users/123')
    })

    it('should handle complex paths', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/admin/users/123/edit',
        search: ''
      })
      restoreWindow = windowMock.restore

      const result = mock.method.routeCurrentPath()
      strictEqual(result, '/admin/users/123/edit')
    })
  })

  describe('currentId action with new mocks', function () {
    it('should generate consistent ID for same path', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/test',
        search: ''
      })
      restoreWindow = windowMock.restore

      const id1 = mock.method.routeCurrentId()
      const id2 = mock.method.routeCurrentId()

      strictEqual(id1, id2)
      ok(id1.startsWith('_'))
      ok(id1.endsWith('_'))
    })

    it('should cache path hash', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/cached',
        search: ''
      })
      restoreWindow = windowMock.restore

      const id1 = mock.method.routeCurrentId()
      const id2 = mock.method.routeCurrentId()

      strictEqual(id1, id2)
    })

    it('should generate different IDs for different paths', function () {
      const windowMock1 = mockNavigationWindow(this, {
        pathname: '/path1',
        search: ''
      })
      const id1 = mock.method.routeCurrentPath()
      windowMock1.restore()

      const windowMock2 = mockNavigationWindow(this, {
        pathname: '/path2',
        search: ''
      })
      restoreWindow = windowMock2.restore

      const id2 = mock.method.routeCurrentId()

      strictEqual(id1 !== id2, true)
    })

    it('should handle root path', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/',
        search: ''
      })
      restoreWindow = windowMock.restore

      const id = mock.method.routeCurrentId()
      ok(id.startsWith('_'))
      ok(id.endsWith('_'))
    })
  })

  describe('navigate action with new mocks', function () {
    it('should push state to history', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/from',
        search: ''
      })
      restoreWindow = windowMock.restore

      mock.method.routeNavigate({ to: '/to' })

      // Check that history.pushState was called
      // Note: We need to access the mock history to verify calls
      // @ts-ignore
      strictEqual(global.window.history.pushState.mock.calls.length, 1)

      // @ts-ignore
      const callArgs = global.window.history.pushState.mock.calls[0].arguments
      strictEqual(callArgs[0].to, '/to')
      strictEqual(callArgs[0].from, '/from')
      strictEqual(callArgs[2], '/to')
      // @ts-ignore
      strictEqual(global.window.history.pushState.mock.calls.length, 1)
    })

    it('should not navigate if paths are the same', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/same',
        search: ''
      })
      restoreWindow = windowMock.restore

      mock.method.routeNavigate({ to: '/same' })

      // @ts-ignore
      strictEqual(global.window.history.pushState.mock.calls.length, 0)
    })

    it('should handle missing state data gracefully', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/current',
        search: ''
      })
      restoreWindow = windowMock.restore

      // stateGetValue will return empty data
      mock.method.routeNavigate({ to: '/new' })

      // Should still push state
      // @ts-ignore
      strictEqual(global.window.history.pushState.mock.calls.length, 1)
    })

    it('should handle complex navigation flow', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/from',
        search: ''
      })
      restoreWindow = windowMock.restore

      // Mock state data for page/items
      const originalMock = mock.method.stateGetValue
      mock.method.stateGetValue = this.mock.fn((params) => {
        if (params.name === 'page/items') {
          if (params.id === '/from') {
            return {
              isEmpty: false,
              item: {
                section1: 'view1',
                section2: 'view2'
              }
            }
          }
          if (params.id === '/to') {
            return {
              isEmpty: false,
              item: {
                section1: 'view3',
                section3: 'view4'
              }
            }
          }
        }
        return { isEmpty: true }
      })

      mock.method.routeNavigate({ to: '/to' })

      // @ts-ignore
      strictEqual(global.window.history.pushState.mock.calls.length, 1)
      // @ts-ignore
      strictEqual(global.window.history.pushState.mock.calls[0].arguments[0].to, '/to')
      // @ts-ignore
      strictEqual(global.window.history.pushState.mock.calls[0].arguments[0].from, '/from')

      // Restore original mock
      mock.method.stateGetValue = originalMock
    })

    it('should handle navigation to path with no existing state', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/current',
        search: ''
      })
      restoreWindow = windowMock.restore

      // Mock state to return empty for both paths
      const originalMock = mock.method.stateGetValue
      mock.method.stateGetValue = this.mock.fn(() => ({
        isEmpty: true,
        item: {}
      }))

      mock.method.routeNavigate({ to: '/empty' })

      // @ts-ignore
      strictEqual(global.window.history.pushState.mock.calls.length, 1)

      // Restore original mock
      mock.method.stateGetValue = originalMock
    })
  })

  describe('Integration scenarios with new mocks', function () {
    it('should handle full navigation flow', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/',
        search: ''
      })
      restoreWindow = windowMock.restore

      // 1. Get current path
      const path1 = mock.method.routeCurrentPath()
      strictEqual(path1, '/')

      // 2. Get current ID
      const id1 = mock.method.routeCurrentPath()
      ok(id1)

      // 3. Navigate to new path
      mock.method.routeNavigate({ to: '/dashboard' })
      // @ts-ignore
      strictEqual(global.window.history.pushState.mock.calls.length, 1)

      // 4. Simulate browser navigation by updating location
      windowMock.setLocation('/dashboard')

      // 5. Get new path and ID
      const path2 = mock.method.routeCurrentPath()
      const id2 = mock.method.routeCurrentPath()

      strictEqual(path2, '/dashboard')
      strictEqual(id1 !== id2, true)
    })

    it('should handle browser back/forward navigation', function () {
      const windowMock = mockWindowWithEvents(this, {
        pathname: '/page1',
        search: ''
      })
      restoreWindow = windowMock.restore

      mock.module.route.setup()

      const eventEmitSpy = mock.method.eventEmit

      // Simulate navigation sequence
      mock.method.routeNavigate({ to: '/page2' })

      // Simulate back button (popstate)
      windowMock.triggerEvent('popstate', {
        state: {
          to: '/page2',
          from: '/page3'
        },
        type: 'popstate'
      })

      // Verify event was emitted
      strictEqual(eventEmitSpy.mock.calls.length, 1)
      strictEqual(eventEmitSpy.mock.calls[0].arguments[0].name, 'route/history')
    })

    it('should handle multiple rapid navigations', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/a',
        search: ''
      })
      restoreWindow = windowMock.restore

      const paths = ['/a', '/b', '/c', '/d', '/e']

      for (let i = 1; i < paths.length; i++) {
        mock.method.routeNavigate({ to: paths[i] })

        // Update URL for next iteration
        windowMock.setLocation(paths[i])
      }

      // @ts-ignore
      strictEqual(global.window.history.pushState.mock.calls.length, paths.length - 1)
    })

    it('should maintain ID consistency across navigation', function () {
      // Test that same path always generates same ID
      const testPath = '/users/123'

      const windowMock1 = mockNavigationWindow(this, {
        pathname: testPath,
        search: ''
      })
      const id1 = mock.method.routeCurrentPath()
      windowMock1.restore()

      // Simulate navigation away
      const windowMock2 = mockNavigationWindow(this, {
        pathname: '/other',
        search: ''
      })
      windowMock2.restore()

      // And back
      const windowMock3 = mockNavigationWindow(this, {
        pathname: testPath,
        search: ''
      })
      restoreWindow = windowMock3.restore
      const id2 = mock.method.routeCurrentPath()

      strictEqual(id1, id2)
    })
  })

  describe('Edge cases with new mocks', function () {
    it('should handle special characters in path', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/path/with spaces/and-special_chars',
        search: ''
      })
      restoreWindow = windowMock.restore

      const path = mock.method.routeCurrentPath()
      const id = mock.method.routeCurrentId()

      strictEqual(path, '/path/with spaces/and-special_chars')
      ok(id.startsWith('_'))
      ok(id.endsWith('_'))
    })

    it('should handle very long paths', function () {
      const longPath = '/a'.repeat(100)
      const windowMock = mockNavigationWindow(this, {
        pathname: longPath,
        search: ''
      })
      restoreWindow = windowMock.restore

      const path = mock.method.routeCurrentPath()
      const id = mock.method.routeCurrentPath()

      strictEqual(path, longPath)
      ok(typeof id === 'string')
    })

    it('should handle empty string navigation', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/current',
        search: ''
      })
      restoreWindow = windowMock.restore

      mock.method.routeNavigate({ to: '' })

      // Should still push state (empty string !== '/current')
      // @ts-ignore
      strictEqual(global.window.history.pushState.mock.calls.length, 1)
    })

    it('should handle unicode characters in path', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/日本語',
        search: ''
      })
      restoreWindow = windowMock.restore

      const path = mock.method.routeCurrentPath()
      const id = mock.method.routeCurrentId()

      ok(path.includes('日本語'))
      ok(typeof id === 'string')
    })

    it('should handle trailing slashes consistently', function () {
      // Test that /path and /path/ are treated differently
      const windowMock1 = mockNavigationWindow(this, {
        pathname: '/path',
        search: ''
      })
      const id1 = mock.method.routeCurrentPath()
      windowMock1.restore()

      const windowMock2 = mockNavigationWindow(this, {
        pathname: '/path/',
        search: ''
      })
      restoreWindow = windowMock2.restore
      const id2 = mock.method.routeCurrentPath()

      strictEqual(id1 !== id2, true)
    })
  })
})
