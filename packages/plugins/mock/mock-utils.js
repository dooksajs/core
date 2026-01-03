/**
 * @import {TestContext} from 'node:test'
 */

/**
 * Creates a mock function that mimics the behavior of getValue from @dooksa/utils
 *
 * This mock function replicates the original getValue utility which retrieves values
 * from nested objects using dot notation or array queries. It supports:
 * - Direct value return when no query is provided
 * - Dot notation queries (e.g., 'a.b.c')
 * - Array queries for multiple values (e.g., ['a.b', 'c.d'])
 * - Handles null/undefined values gracefully
 *
 * @param {TestContext} t - The test context constructor
 * @returns {Function} A mock function that mimics getValue behavior
 *
 * @example
 * // Create mock getValue function
 * const mockGetValue = createMockGetValue(t)
 *
 * // Test with dot notation
 * const result = mockGetValue({ a: { b: 'c' } }, 'a.b')
 * // Returns: 'c'
 *
 * @example
 * // Test with array queries
 * const result = mockGetValue({ x: 1, y: 2 }, ['x', 'y'])
 * // Returns: [1, 2]
 *
 * @example
 * // Test with null value
 * const result = mockGetValue(null, 'any.property')
 * // Returns: undefined
 */
export function createMockGetValue (t) {
  return t.mock.fn((value, query) => {
    if (query == null) return value
    if (Array.isArray(query)) {
      return query.map(q => {
        const keys = q.split('.')
        let result = value
        for (const key of keys) {
          if (result == null) return undefined
          result = result[key]
        }
        return result
      })
    }
    if (typeof query !== 'string') return undefined
    const keys = query.split('.')
    let result = value
    for (const key of keys) {
      if (result == null) return undefined
      result = result[key]
    }
    return result
  })
}

/**
 * Creates a mock function that mimics the behavior of generateId from @dooksa/utils
 *
 * This mock function replicates the original generateId utility which generates
 * a unique identifier with a consistent format for testing purposes.
 *
 * @param {TestContext} t - The test context constructor
 * @returns {Function} A mock function that returns a test ID
 *
 * @example
 * // Create mock generateId function
 * const mockGenerateId = createMockGenerateId(t)
 *
 * // Generate a test ID
 * const id = mockGenerateId()
 * // Returns: '_test_id_12345_'
 *
 * @example
 * // Use in test assertions
 * const id = mockGenerateId()
 * strictEqual(id, '_test_id_12345_')
 */
export function createMockGenerateId (t) {
  return t.mock.fn(() => '_test_id_12345_')
}
