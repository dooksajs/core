import createPlugin from '@dooksa/create-plugin'

/**
 * Creates a mock plugin for testing
 *
 * @param {string} name - Plugin name
 * @param {Object} config - Plugin configuration
 * @returns {Object} Mock plugin
 *
 * @example
 * // Create a simple plugin
 * const plugin = createMockPlugin('test', {
 *   state: {
 *     schema: {
 *       values: {
 *         type: 'collection',
 *         items: { type: 'object' }
 *       }
 *     }
 *   },
 *   actions: {
 *     getValue: {
 *       method: (props) => props.value
 *     }
 *   }
 * })
 */
export function createMockPlugin (name, config) {
  return createPlugin(name, config)
}
