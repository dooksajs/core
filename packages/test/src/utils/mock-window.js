/**
 * Mock window.location.search
 * @param {import('node:test').TestContext} context
 * @param {string} [search=''] - Search query
 */
export function mockWindowLocationSearch (context, search = '') {
  const originalWindow = global.window
  // Create a mock for window.location.search
  // @ts-ignore
  global.window = { location: {} }

  Object.defineProperty(global.window.location, 'search', {
    get () {
      return search
    },
    set (value) {
      search = value
    },
    configurable: true
  })

  // mock the search getter
  context.mock.method(global.window.location, 'search', {
    getter: true
  })

  /**
   * Restore window object
   */
  return () => {
    if (!originalWindow) {
      delete global.window
    } else {
      global.window = originalWindow
    }
  }
}
