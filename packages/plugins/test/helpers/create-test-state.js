import { createState } from './create-state.js'
import { getTestPlugins } from './test-plugins.js'

/**
 * Creates a mock state environment for testing with a comprehensive set of schemas
 *
 * @param {Array} [additionalPlugins=[]] - Additional plugins to include
 * @returns {Object} State export object
 */
export function createTestState (additionalPlugins = []) {
  const plugins = getTestPlugins(additionalPlugins)

  return createState(plugins)
}
