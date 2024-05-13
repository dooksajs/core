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
  // assign action scope
  if (plugin.actions) {
    for (const key in plugin.actions) {
      if (Object.hasOwnProperty.call(plugin.actions, key)) {
        const action = plugin.actions[key]

        plugin.actions[key] = action.bind(plugin.actions)
      }
    }
  }

  return plugin
}

export { createPlugin }
