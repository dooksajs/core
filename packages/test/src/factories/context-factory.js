/**
 * Creates a test context object for action execution
 *
 * @param {Object} [overrides={}] - Context property overrides
 * @returns {Object} Test context object
 *
 * @example
 * // Basic context
 * const context = createContext()
 *
 * // Custom context
 * const context = createContext({
 *   id: 'test-component-123',
 *   parentId: 'parent-456',
 *   groupId: 'group-789',
 *   rootId: 'root-012'
 * })
 */
export function createContext (overrides = {}) {
  return {
    id: 'test-component',
    parentId: 'parent-test',
    groupId: 'group-test',
    rootId: 'root-test',
    ...overrides
  }
}
