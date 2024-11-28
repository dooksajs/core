/**
 * Mock window.location.search
 * @param {string} [search=''] - Search query
 * @returns {Function} - delete window object
 */
export function mockWindowLocationSearch (search = '') {
  // Create a mock for window.location.search
  global.window = {
    // @ts-ignore
    location: { search }
  }

  // delete window object
  return () => {
    delete global.window
  }
}
