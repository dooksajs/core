import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual, ok } from 'node:assert'
import { mockPlugin, mockNavigationWindow, mockWindowWithEvents } from '@dooksa/test'

describe('Route plugin', function () {
  let mock

  beforeEach(async function () {
    // Setup mock plugin with client modules
    mock = await mockPlugin(this, {
      name: 'route',
      platform: 'client',
      clientModules: ['event', 'action', 'page']
    })
  })

  afterEach(function () {
    if (mock) {
      mock.restore()
    }
  })

  describe('Setup', function () {
    it('should register popstate event listener', function () {
      // Use mockWindowWithEvents for comprehensive event testing
      const windowMock = mockWindowWithEvents(this, {
        pathname: '/',
        search: ''
      })

      // Call setup
      mock.client.setup.route()

      // Verify addEventListener was called with popstate
      const eventListeners = windowMock.getEventListeners()
      strictEqual(eventListeners.popstate.length, 1)

      windowMock.restore()
    })

    it('should emit route/history event on popstate', function () {
      const windowMock = mockWindowWithEvents(this, {
        pathname: '/test',
        search: ''
      })

      mock.client.setup.route()

      // Trigger popstate event
      windowMock.triggerEvent('popstate', {
        state: {
          to: '/test',
          from: '/'
        },
        type: 'popstate'
      })

      // Verify eventEmit was called
      strictEqual(mock.client.method.eventEmit.mock.calls.length, 1)

      const callArgs = mock.client.method.eventEmit.mock.calls[0].arguments[0]
      strictEqual(callArgs.name, 'route/history')
      strictEqual(callArgs.id, 'popstate')
      ok(callArgs.payload)
      ok(callArgs.payload.location)
      ok(callArgs.payload.state)

      windowMock.restore()
    })
  })

  describe('currentPath action', function () {
    it('should return "/" when pathname is empty', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '',
        search: ''
      })

      const result = mock.client.method.routeCurrentPath()
      strictEqual(result, '/')

      windowMock.restore()
    })

    it('should return "/" when pathname is "/"', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/',
        search: ''
      })

      const result = mock.client.method.routeCurrentPath()
      strictEqual(result, '/')

      windowMock.restore()
    })

    it('should return actual pathname', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/users/123',
        search: ''
      })

      const result = mock.client.method.routeCurrentPath()
      strictEqual(result, '/users/123')

      windowMock.restore()
    })

    it('should handle complex paths', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/admin/users/123/edit',
        search: ''
      })

      const result = mock.client.method.routeCurrentPath()
      strictEqual(result, '/admin/users/123/edit')

      windowMock.restore()
    })
  })

  describe('currentId action', function () {
    it('should generate consistent ID for same path', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/test',
        search: ''
      })

      const id1 = mock.client.method.routeCurrentId()
      const id2 = mock.client.method.routeCurrentId()

      strictEqual(id1, id2)
      ok(id1.startsWith('_'))
      ok(id1.endsWith('_'))

      windowMock.restore()
    })

    it('should cache path hash', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/cached',
        search: ''
      })

      const id1 = mock.client.method.routeCurrentId()
      const id2 = mock.client.method.routeCurrentId()

      strictEqual(id1, id2)

      windowMock.restore()
    })

    it('should generate different IDs for different paths', function () {
      const windowMock1 = mockNavigationWindow(this, {
        pathname: '/path1',
        search: ''
      })
      const id1 = mock.client.method.routeCurrentId()
      windowMock1.restore()

      const windowMock2 = mockNavigationWindow(this, {
        pathname: '/path2',
        search: ''
      })
      const id2 = mock.client.method.routeCurrentId()
      windowMock2.restore()

      strictEqual(id1 !== id2, true)
    })

    it('should handle root path', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/',
        search: ''
      })

      const id = mock.client.method.routeCurrentId()
      ok(id.startsWith('_'))
      ok(id.endsWith('_'))

      windowMock.restore()
    })
  })

  describe('navigate action', function () {
    it('should push state to history', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/from',
        search: ''
      })

      mock.client.method.routeNavigate({ to: '/to' })

      // Check that history.pushState was called
      strictEqual(global.window.history.pushState.mock.calls.length, 1)

      const callArgs = global.window.history.pushState.mock.calls[0].arguments
      strictEqual(callArgs[0].to, '/to')
      strictEqual(callArgs[0].from, '/from')
      strictEqual(callArgs[2], '/to')

      windowMock.restore()
    })

    it('should not navigate if paths are the same', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/same',
        search: ''
      })

      mock.client.method.routeNavigate({ to: '/same' })

      strictEqual(global.window.history.pushState.mock.calls.length, 0)

      windowMock.restore()
    })

    it('should handle missing state data gracefully', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/current',
        search: ''
      })

      // stateGetValue will return empty data by default
      mock.client.method.routeNavigate({ to: '/new' })

      // Should still push state
      strictEqual(global.window.history.pushState.mock.calls.length, 1)

      windowMock.restore()
    })

    it('should handle complex navigation flow', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/from',
        search: ''
      })

      // Mock state data for page/items
      const originalMock = mock.client.method.stateGetValue
      mock.client.method.stateGetValue = this.mock.fn((params) => {
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

      mock.client.method.routeNavigate({ to: '/to' })

      strictEqual(global.window.history.pushState.mock.calls.length, 1)
      strictEqual(global.window.history.pushState.mock.calls[0].arguments[0].to, '/to')
      strictEqual(global.window.history.pushState.mock.calls[0].arguments[0].from, '/from')

      // Restore original mock
      mock.client.method.stateGetValue = originalMock
      windowMock.restore()
    })

    it('should handle navigation to path with no existing state', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/current',
        search: ''
      })

      // Mock state to return empty for both paths
      const originalMock = mock.client.method.stateGetValue
      mock.client.method.stateGetValue = this.mock.fn(() => ({
        isEmpty: true,
        item: {}
      }))

      mock.client.method.routeNavigate({ to: '/empty' })

      strictEqual(global.window.history.pushState.mock.calls.length, 1)

      // Restore original mock
      mock.client.method.stateGetValue = originalMock
      windowMock.restore()
    })
  })

  describe('Integration scenarios', function () {
    it('should handle full navigation flow', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/',
        search: ''
      })

      // 1. Get current path
      const path1 = mock.client.method.routeCurrentPath()
      strictEqual(path1, '/')

      // 2. Get current ID
      const id1 = mock.client.method.routeCurrentId()
      ok(id1)

      // 3. Navigate to new path
      mock.client.method.routeNavigate({ to: '/dashboard' })
      strictEqual(global.window.history.pushState.mock.calls.length, 1)

      // 4. Simulate browser navigation by updating location
      windowMock.setLocation('/dashboard')

      // 5. Get new path and ID
      const path2 = mock.client.method.routeCurrentPath()
      const id2 = mock.client.method.routeCurrentId()

      strictEqual(path2, '/dashboard')
      strictEqual(id1 !== id2, true)

      windowMock.restore()
    })

    it('should handle browser back/forward navigation', function () {
      const windowMock = mockWindowWithEvents(this, {
        pathname: '/page1',
        search: ''
      })

      mock.client.setup.route()

      const eventEmitSpy = mock.client.method.eventEmit

      // Simulate navigation sequence
      mock.client.method.routeNavigate({ to: '/page2' })

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

      windowMock.restore()
    })

    it('should handle multiple rapid navigations', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/a',
        search: ''
      })

      const paths = ['/a', '/b', '/c', '/d', '/e']

      for (let i = 1; i < paths.length; i++) {
        mock.client.method.routeNavigate({ to: paths[i] })

        // Update URL for next iteration
        windowMock.setLocation(paths[i])
      }

      strictEqual(global.window.history.pushState.mock.calls.length, paths.length - 1)

      windowMock.restore()
    })

    it('should maintain ID consistency across navigation', function () {
      // Test that same path always generates same ID
      const testPath = '/users/123'

      const windowMock1 = mockNavigationWindow(this, {
        pathname: testPath,
        search: ''
      })
      const id1 = mock.client.method.routeCurrentId()
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
      const id2 = mock.client.method.routeCurrentId()
      windowMock3.restore()

      strictEqual(id1, id2)
    })
  })

  describe('Edge cases', function () {
    it('should handle special characters in path', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/path/with spaces/and-special_chars',
        search: ''
      })

      const path = mock.client.method.routeCurrentPath()
      const id = mock.client.method.routeCurrentId()

      strictEqual(path, '/path/with spaces/and-special_chars')
      ok(id.startsWith('_'))
      ok(id.endsWith('_'))

      windowMock.restore()
    })

    it('should handle very long paths', function () {
      const longPath = '/a'.repeat(100)
      const windowMock = mockNavigationWindow(this, {
        pathname: longPath,
        search: ''
      })

      const path = mock.client.method.routeCurrentPath()
      const id = mock.client.method.routeCurrentId()

      strictEqual(path, longPath)
      ok(typeof id === 'string')

      windowMock.restore()
    })

    it('should handle empty string navigation', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/current',
        search: ''
      })

      mock.client.method.routeNavigate({ to: '' })

      // Should still push state (empty string !== '/current')
      strictEqual(global.window.history.pushState.mock.calls.length, 1)

      windowMock.restore()
    })

    it('should handle unicode characters in path', function () {
      const windowMock = mockNavigationWindow(this, {
        pathname: '/日本語',
        search: ''
      })

      const path = mock.client.method.routeCurrentPath()
      const id = mock.client.method.routeCurrentId()

      ok(path.includes('日本語'))
      ok(typeof id === 'string')

      windowMock.restore()
    })

    it('should handle trailing slashes consistently', function () {
      // Test that /path and /path/ are treated differently
      const windowMock1 = mockNavigationWindow(this, {
        pathname: '/path',
        search: ''
      })
      const id1 = mock.client.method.routeCurrentId()
      windowMock1.restore()

      const windowMock2 = mockNavigationWindow(this, {
        pathname: '/path/',
        search: ''
      })
      const id2 = mock.client.method.routeCurrentId()
      windowMock2.restore()

      strictEqual(id1 !== id2, true)
    })
  })

  describe('Plugin metadata', function () {
    it('should export route actions', function () {
      // Verify the actions are available
      ok(mock.client.method.routeCurrentPath)
      ok(mock.client.method.routeCurrentId)
      ok(mock.client.method.routeNavigate)

      strictEqual(typeof mock.client.method.routeCurrentPath, 'function')
      strictEqual(typeof mock.client.method.routeCurrentId, 'function')
      strictEqual(typeof mock.client.method.routeNavigate, 'function')
    })
  })
})
