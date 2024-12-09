/**
 * @import { Plugin, PluginState } from '#types'
 */

import { deepClone } from '@dooksa/utils'

/**
 * @param {Plugin} plugin
 * @param {string[]} [names]
 * @returns {PluginState}
 */
export function mapState (plugin, names) {
  if (typeof plugin !== 'object') {
    throw new Error('DooksaError: mapState expects a plugin')
  }

  if ((plugin && !plugin.state) ||
    (plugin && plugin.state && !plugin.state.schema)) {
    throw new Error('DooksaError: mapState could not find state schema')
  }

  const schema = plugin.state.schema
  const stateDefaults = plugin.state.defaults || {}

  // map schema by name
  if (names) {
    let hasDefaults = false
    const defaults = {}
    /** @type {PluginState} */
    const result = {
      schema: {}
    }

    for (let i = 0; i < names.length; i++) {
      const name = names[i]

      if (!schema.hasOwnProperty(name)) {
        throw new Error('DooksaError: mapState could not find property name "'+ name +'"')
      }

      result.schema[name] = deepClone(schema[name])

      if (stateDefaults[name]) {
        hasDefaults = true
        defaults[name] = stateDefaults[name]
      }
    }

    if (hasDefaults) {
      result.defaults = defaults
    }

    return result
  }

  // shallow copy schema
  return deepClone(plugin.state)
}
