/**
 * @dooksa/test - Centralized testing utilities for Dooksa packages
 *
 * This package provides a comprehensive set of testing utilities including:
 * - Plugin mocking
 * - State management mocking
 * - Utility function mocks
 * - Assertion helpers
 * - Test data factories
 */

// Plugins
export * from './plugins/index.js'

// Utilities
export * from './utils/index.js'

// Assertions
export {
  assertActionDispatched,
  assertStateSet,
  assertStateNotSet,
  assertMethodCalled,
  assertNoMethodCalls,
  assertBlockStructure
} from './assertions/index.js'

// Factories
export {
  createContext,
  createMockAction as createAction,
  createMockPlugin,
  createMockState
} from './factories/index.js'
