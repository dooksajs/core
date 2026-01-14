/**
 * @import { DsPlugin, DsPluginState } from '#types'
 */

/**
 * Maps state schema from a plugin, optionally filtering by specific property names.
 *
 * This function extracts the state schema and defaults from a plugin object, allowing
 * you to either map all state properties or selectively map only specific named properties.
 * When names are provided, only those properties are included in the result, otherwise
 * all state properties from the plugin are mapped.
 *
 * @param {DsPlugin} plugin - The plugin object containing state schema to map
 * @param {string[]} [names] - Optional array of property names to selectively map.
 *   If provided, only these specific state properties will be included in the result.
 *   If omitted, all state properties from the plugin will be mapped.
 * @returns {DsPluginState} An object containing the mapped state schema and optionally defaults.
 *   The returned object has:
 *   - `schema`: The state schema object (either full or filtered by names)
 *   - `defaults`: Optional default values for the mapped properties (if they exist)
 * @throws {Error} When plugin is not an object
 * @throws {Error} When plugin has no state or state schema
 * @throws {Error} When a specified property name doesn't exist in the plugin's schema
 * @example
 * // Spread schema into plugin state (like page.js)
 * const plugin = createPlugin('myPlugin', {
 *   state: {
 *     schema: {
 *       app: { type: 'string' },
 *       ...mapState(someOtherPlugin).schema
 *     }
 *   }
 * })
 *
 * @example
 * // Spread entire result into plugin state (like action.js)
 * const plugin = createPlugin('myPlugin', {
 *   state: { ...mapState(someOtherPlugin) }
 * })
 *
 * @example
 * // Map specific properties only
 * const plugin = createPlugin('myPlugin', {
 *   state: {
 *     schema: {
 *       ...mapState(someOtherPlugin, ['property1', 'property2']).schema
 *     }
 *   }
 * })
 */
export function mapState (plugin, names) {
  if (typeof plugin !== 'object') {
    throw new Error('DooksaError: mapState expects a plugin')
  }

  if ((plugin && !plugin.state) ||
    (plugin && plugin.state && !plugin.state.schema)) {
    throw new Error('DooksaError: mapState could not find state schema')
  }

  /** @type {DsPluginState} */
  const result = {
    schema: {}
  }
  const schema = plugin.state.schema
  const stateDefaults = plugin.state.defaults

  // map schema by name
  if (names) {
    let defaults = {}

    for (let i = 0; i < names.length; i++) {
      const name = names[i]

      if (!schema.hasOwnProperty(name)) {
        throw new Error('DooksaError: mapState could not find property name "'+ name +'"')
      }

      result.schema[name] = schema[name]

      if (stateDefaults && stateDefaults[name]) {
        defaults[name] = stateDefaults[name]
      }
    }

    // set defaults
    if (Object.getOwnPropertyNames(defaults).length) {
      result.defaults = defaults
    }

    return result
  }

  result.schema = schema

  if (stateDefaults) {
    result.defaults = stateDefaults
  }

  return result
}
