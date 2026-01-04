/**
 * @import {TestContext} from 'node:test'
 */

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
