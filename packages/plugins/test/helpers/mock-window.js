/**
 * @import {TestContext} from 'node:test'
 */

/**
 * Extensible window mock utility
 * Preserves existing window properties while allowing targeted mocking
 */

/**
 * Creates a mock window environment with configurable properties
 * @param {TestContext} context - The test context
 * @param {Object} options - Mock configuration
 * @param {string} [options.pathname='/'] - Window location pathname
 * @param {string} [options.search=''] - Window location search
 * @param {string} [options.href] - Full URL (overrides pathname/search)
 * @param {Object} [options.history] - History API mock
 * @param {Function} [options.addEventListener] - Custom addEventListener
 * @returns {Object} Restore function and mock references
 */
export function mockWindow (context, options = {}) {
  const originalWindow = global.window
  const originalLocation = global.window?.location
  const originalHistory = global.window?.history

  // Create base window if it doesn't exist
  if (!global.window) {
    // @ts-ignore
    global.window = {}
  }

  // Store original methods for restoration
  const originalAddEventListener = global.window.addEventListener
  const originalDispatchEvent = global.window.dispatchEvent

  // Configure location
  let locationConfig = {}

  if (options.href) {
    const url = new URL(options.href)
    locationConfig = {
      pathname: url.pathname,
      search: url.search,
      href: options.href
    }
  } else {
    locationConfig = {
      pathname: options.pathname || '/',
      search: options.search || ''
    }
  }

  // Create location object with getters/setters
  const mockLocation = {}
  Object.keys(locationConfig).forEach((key) => {
    let value = locationConfig[key]
    Object.defineProperty(mockLocation, key, {
      get () {
        return value
      },
      set (newValue) {
        value = newValue
      },
      configurable: true,
      enumerable: true
    })
  })

  // Set location on window
  Object.defineProperty(global.window, 'location', {
    value: mockLocation,
    configurable: true,
    enumerable: true,
    writable: true
  })

  // Mock history
  if (options.history) {
    global.window.history = options.history
  } else {
    const mockHistory = {
      length: 1,
      scrollRestoration: 'auto',
      state: null,
      pushState: context.mock.fn((state, title, url) => {
        if (url) {
          // Update location when pushState is called
          const newUrl = new URL(url, 'http://localhost')
          mockLocation.pathname = newUrl.pathname
          mockLocation.search = newUrl.search
        }
      }),
      replaceState: context.mock.fn(),
      back: context.mock.fn(),
      forward: context.mock.fn(),
      go: context.mock.fn()
    }
    // @ts-ignore
    global.window.history = mockHistory
  }

  // Mock addEventListener if not provided
  const eventListeners = {}
  const mockAddEventListener = options.addEventListener || context.mock.fn((event, handler) => {
    if (!eventListeners[event]) {
      eventListeners[event] = []
    }
    eventListeners[event].push(handler)
  })
  // @ts-ignore
  global.window.addEventListener = mockAddEventListener

  // Mock dispatchEvent for testing
  const mockDispatchEvent = context.mock.fn((event) => {
    const handlers = eventListeners[event.type] || []
    handlers.forEach((handler) => handler(event))
    return true
  })
  // @ts-ignore
  global.window.dispatchEvent = mockDispatchEvent

  // Return restore function and helpers
  return {
    restore: () => {
      if (!originalWindow) {
        // @ts-ignore
        delete global.window
      } else {
        global.window = originalWindow
        if (originalLocation) {
          // @ts-ignore
          global.window.location = originalLocation
        }
        if (originalHistory) {
          // @ts-ignore
          global.window.history = originalHistory
        }
        if (originalAddEventListener) {
          // @ts-ignore
          global.window.addEventListener = originalAddEventListener
        }
        if (originalDispatchEvent) {
          // @ts-ignore
          global.window.dispatchEvent = originalDispatchEvent
        }
      }
    },
    // Helpers for testing
    getEventListeners: () => eventListeners,
    setLocation: (pathname, search = '') => {
      mockLocation.pathname = pathname
      mockLocation.search = search
    },
    triggerPopState: (state) => {
      const event = {
        type: 'popstate',
        state
      }
      const handlers = eventListeners.popstate || []
      handlers.forEach((handler) => handler(event))
    }
  }
}

/**
 * Convenience function for mocking just window.location.search
 * Uses the full mockWindow internally but maintains backward compatibility
 * @param {TestContext} context - The test context
 * @param {string} [search=''] - Search query string
 * @returns {Function} Restore function
 */
export function mockWindowLocationSearch (context, search = '') {
  const mock = mockWindow(context, { search })
  return mock.restore
}

/**
 * Mock window for navigation testing
 * Sets up a complete navigation environment
 * @param {TestContext} context - The test context
 * @param {Object} [options] - Configuration options
 * @param {string} [options.pathname='/'] - Initial pathname
 * @param {string} [options.search=''] - Initial search query
 * @param {Object} [options.history] - Custom history mock
 * @returns {Object} Mock with restore and helper methods
 */
export function mockNavigationWindow (context, options = {}) {
  return mockWindow(context, {
    pathname: options.pathname || '/',
    search: options.search || '',
    history: options.history || {
      pushState: context.mock.fn(),
      replaceState: context.mock.fn(),
      back: context.mock.fn(),
      forward: context.mock.fn(),
      go: context.mock.fn()
    }
  })
}

/**
 * Mock window with addEventListener support
 * Specifically useful for plugins that need event listener functionality
 * @param {TestContext} context - The test context
 * @param {Object} [options] - Configuration options
 * @param {string} [options.pathname='/'] - Initial pathname
 * @param {string} [options.search=''] - Initial search query
 * @returns {Object} Mock with restore and event listener tracking
 */
export function mockWindowWithEvents (context, options = {}) {
  const eventListeners = {}

  const mockAddEventListener = context.mock.fn((event, handler) => {
    if (!eventListeners[event]) {
      eventListeners[event] = []
    }
    eventListeners[event].push(handler)
  })

  const mock = mockWindow(context, {
    pathname: options.pathname || '/',
    search: options.search || '',
    addEventListener: mockAddEventListener
  })

  // Extend mock with event-specific helpers
  return {
    ...mock,
    getEventListeners: () => eventListeners,
    triggerEvent: (eventName, eventData) => {
      const handlers = eventListeners[eventName] || []
      handlers.forEach((handler) => handler(eventData))
    },
    clearEventListeners: () => {
      Object.keys(eventListeners).forEach((key) => {
        eventListeners[key] = []
      })
    }
  }
}
