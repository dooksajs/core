/**
 * @import { Plugin, PluginSchema } from '#types'
 */

/**
 * @param {Plugin} plugin
 * @param {string[]} [names]
 * @returns {PluginSchema}
 */
export function mapSchema (plugin, names) {
  const schema = plugin.schema

  if (!plugin.schema) {
    throw new Error('DooksaError: mapSchema could not schema')
  }

  // map schema by name
  if (names) {
    /** @type {PluginSchema} */
    const result = {}

    for (let i = 0; i < names.length; i++) {
      const name = names[i]

      if (!schema.hasOwnProperty(name)) {
        throw new Error('DooksaError: mapSchema could not find property name "'+ name +'"')
      }

      result[name] = Object.assign({}, schema[name])
    }

    return result
  }

  // shallow copy schema
  return Object.assign({}, schema)
}
