/**
 * Creates a mock state object for testing
 *
 * @param {Object} [overrides={}] - State property overrides
 * @returns {Object} Mock state object
 *
 * @example
 * // Basic state
 * const state = createMockState()
 *
 * // Custom state with data
 * const state = createMockState({
 *   'variable/values': {
 *     'test-scope': { key: 'value' }
 *   }
 * })
 */
export function createMockState (overrides = {}) {
  return {
    _defaults: [],
    _items: [],
    _names: [],
    _values: {},
    defaults: [],
    schema: {},
    ...overrides
  }
}
