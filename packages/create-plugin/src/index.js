/** @typedef {import('../../global-typedef.js').DataSchema} DataSchema */

/**
 * @template T
 * @template {Object} P
 * @callback PluginSetup
 * @this {T}
 * @param {P} [param]
 */

/**
 * @template {function} T
 * @typedef {Object.<string, T>} PluginData
 */

/**
 * @template P
 * @template {Object.<string, (number|string|boolean|number[]|string[]|Object[]|Array[]|Object.<string,D>)>} D
 * @template {Object.<string, function>} A
 * @param {Object} plugin
 * @param {string} plugin.name
 * @param {D} [plugin.data]
 * @param {Object.<string, DataSchema>} [plugin.models]
 * @param {A} [plugin.methods]
 * @param {A} [plugin.actions]
 * @param {PluginSetup<D & A,P>} [plugin.setup] - Setup m
 * @returns {PluginResult}
 */
function createPlugin (plugin) {
  /**
   * @typedef {Object.<string,(D[keyof D]|A[keyof A])>} PluginContext
   */

  /** @type {PluginContext} */
  const context = {}

  /**
   * @typedef {Object} PluginResult
   * @property {A} [actions]
   * @property {Object.<string, DataSchema>} [models]
   * @property {PluginSetup<D & A,P>} [setup]
   * @property {string} name
   */

  /** @type {PluginResult} */
  const results = {
    name: plugin.name,
    actions: plugin.actions,
    models: plugin.models,
    setup: plugin.setup
  }

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
  if (plugin.methods) {
    for (const key in plugin.methods) {
      if (Object.hasOwnProperty.call(plugin.methods, key)) {
        const method = plugin.methods[key]

        context[key] = method

        plugin.methods[key] = method.bind(context)
      }
    }
  }


  // assign action scope
  if (plugin.actions) {
    for (const key in plugin.actions) {
      if (Object.hasOwnProperty.call(plugin.actions, key)) {
        const action = plugin.actions[key]

        context[key] = action

        plugin.actions[key] = action.bind(context)
        results.actions[key] = plugin.actions[key]
      }
    }
  }

  if (plugin.setup) {
    plugin.setup = plugin.setup.bind(context)
    results.setup = plugin.setup
  }

  return results
}

export default createPlugin
