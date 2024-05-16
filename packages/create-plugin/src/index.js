/** @typedef {import('../../global-typedef.js').DataSchema} DataSchema */
/** @typedef {import('../../global-typedef.js').Component} Component */

/**
 * @template {Object.<string, function>} A
 * @template {Object.<string, DataSchema>} M
 * @template {Object.<string, *>} D
 * @param {Object} plugin
 * @param {string} plugin.name - Plugin name
 * @param {Object[]} [plugin.dependencies] - Dependent plugin
 * @param {Component[]} [plugin.components] - Components
 * @param {M} [plugin.models] - Data model for the plugin
 * @param {D} [plugin.data] - Private data shared between actions and setup functions
 * @param {A} [plugin.actions] - Global actions
 * @param {Function} [plugin.setup] - Setup m
 */
function createPlugin (plugin) {
  /**
   * @type {Object.<string,(D[keyof D]|A[keyof A])>}
   */
  const context = {}

  if (plugin.data) {
    for (const key in plugin.data) {
      if (Object.hasOwnProperty.call(plugin.data, key)) {
        const data = plugin.data[key]

        context[key] = data

        plugin.data[key] = data
      }
    }
  }


  // assign action scope
  if (plugin.actions) {
    for (const key in plugin.actions) {
      if (Object.hasOwnProperty.call(plugin.actions, key)) {
        const action = plugin.actions[key]

        context[key] = action

        /** @this {context} */
        plugin.actions[key] = action.bind(context)
      }
    }
  }

  if (plugin.setup) {
    /** @this {context} */
    plugin.setup = plugin.setup.bind(context)
  }

  return plugin
}

export default createPlugin
