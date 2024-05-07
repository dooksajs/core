import { getActiveContext } from './context.js'

/** @typedef {import('../../global-typedef.js').DataSchema} DataSchema */

/**
 * @template {Object.<string, function>} A
 * @template {Object.<string, DataSchema>} D
 * @param {Object} plugin
 * @param {string} plugin.name
 * @param {Object[]} [plugin.dependencies]
 * @param {D} [plugin.data]
 * @param {A} [plugin.actions]
 * @param {Object} [plugin.actionSchema]
 * @param {Function} [plugin.setup]
 */
function createPlugin (plugin) {
  return plugin
}

export { createPlugin }
