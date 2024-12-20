/**
 * @import { DsPlugin, DsPluginState } from '#types'
 */

/**
 * @param {DsPlugin} plugin
 * @param {string[]} [names]
 * @returns {DsPluginState}
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
