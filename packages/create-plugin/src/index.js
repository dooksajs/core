
/** @typedef {import('../../types.js').DataSchema} DataSchema */

function mergeContextProperties (data, context) {
  const result = {}

  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      const element = data[key]

      context[key] = element

      if (typeof element === 'function') {
        result[key] = element.bind(context)
      } else {
        result[key] = element
      }
    }
  }

  return result
}

/**
 * Prefix action with plugin name
 * @template {string} Name
 * @template {string} Type
 * @typedef {`${Name}${Capitalize<Type>}`} PluginExportAction
 */

/**
 * @template This
 * @template {Object} Params
 * @callback PluginSetup
 * @this {This}
 * @param {Params} params
 */

/**
 * @typedef {Object} PluginActionContext
 * @property {Object} [context]
 * @property {Object} [payload]
 * @property {Object} [blockValues]
 */

/**
 * @template This
 * @callback PluginAction
 * @this {This}
 * @param {Object} [params]
 * @param {PluginActionContext} [context]
 */

/**
 * @typedef {Object} PluginMetadataItem
 * @property {string} title
 * @property {string} description
 * @property {string} icon
 */

/**
 * @typedef {Object} PluginMetadata
 * @property {PluginMetadataItem} plugin
 * @property {Object.<string, PluginMetadataItem>} [actions]
 */

/**
 * @typedef {number|string|boolean} PluginDataTypes
 * @typedef {Object.<string, PluginDataTypes|PluginDataTypes[]|Object.<string,PluginDataTypes>|Object.<string,PluginDataTypes>[]>} PluginData
 */

/**
 * @template {PluginData} Data
 * @template {Object.<string, Function>} Action
 * @template {Object.<string, Function>} Method
 * @typedef {Data & Action & Method} PluginContext
 */

/**
 * @typedef {Object.<string, DataSchema>} PluginModal
 */

/**
 * @template {Object.<string, Function>} Action
 * @typedef {Object} PluginExport
 * @property {string} name
 * @property {Action} [actions]
 * @property {PluginModal} [models]
 * @property {Function} initialise
 */

/**
 * @template {Object.<string, Function>} Action
 * @template {Object.<string, Function>} Method
 * @template {string} Name
 * @template {PluginData} Data
 * @param {Name} name
 * @param {Object} data
 * @param {PluginExport<Action>[]} [data.dependencies]
 * @param {PluginMetadata} [data.metadata]
 * @param {PluginModal} [data.models]
 * @param {Data} [data.data] - Private data that can be used within actions/setup/methods
 * @param {Method} [data.methods] - Private methods that can be used within actions/setup
 * @param {Action} [data.actions] - Public methods (actions)
 * @param {Object.<string, function>} [data.tokens]
 * @param {PluginSetup<PluginContext<Data, Action, Method>, Object>} [data.setup] - Setup plugin
 */
function createPlugin (name, data) {
  const context = {}
  /**
   * @typedef {Object} Plugin
   * @property {PluginMetadata} [metadata]
   * @property {Object} [tokens]
   * @property {PluginSetup<PluginContext<Data, Action, Method>, Object>} [setup]
   * @property {Object.<string, Function>} [actions]
   */

  /** @type {Plugin} */
  const pluginData = {}

  /**
   * @type {PluginExport<Action>}
   */
  const plugin = {
    name,
    initialise () {
      return pluginData
    }
  }

  if (data.data) {
    mergeContextProperties(data.data, context)
  }

  if (data.methods) {
    mergeContextProperties(data.methods, context)
  }

  if (data.models) {
    plugin.models = data.models
  }

  if (data.tokens) {
    pluginData.tokens = mergeContextProperties(data.tokens, context)
  }

  if (data.setup) {
    pluginData.setup = data.setup.bind(context)
  }



  if (data.actions) {
    pluginData.actions = {}
    plugin.actions = {}

    for (const key in data.actions) {
      const context = { context: {}, payload: {}, blockValues: {} }

      if (Object.hasOwnProperty.call(data.actions, key)) {
        const action = data.actions[key].bind(context)

        // app actions
        pluginData.actions[name + '_' + key] = action

        // export actions
        plugin.actions[key] = (params) => {
          return action(params, context)
        }
      }
    }
  }


  return plugin
}

export default createPlugin
