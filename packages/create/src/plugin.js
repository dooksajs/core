/** @typedef {import('../../global-typedef.js').DataSchema} DataSchema */

/**
 * @template {Object.<string, function>} A
 * @template {Object.<string, DataSchema>} D
 * @param {Object} plugin
 * @param {string} plugin.name
 * @param {Object[]} [plugin.dependencies]
 * @param {Object[]} [plugin.components]
 * @param {D} [plugin.data]
 * @param {A} [plugin.actions]
 * @param {Function} [plugin.setup]
 */
function createPlugin (plugin) {
  return plugin
}

export { createPlugin }
