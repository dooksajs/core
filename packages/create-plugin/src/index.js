
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
 * @typedef {Object} PluginMetadata
 * @property {string} title
 * @property {string} description
 * @property {string} icon
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
 * @property {Object} metadata
 * @property {PluginMetadata} metadata.plugin
 * @property {Object.<string, PluginMetadata>} [metadata.actions]
 * @property {{ [Property in keyof Action]: Action[Property] }} [actions]
 * @property {PluginModal} [models]
 * @property {Function} initialise
 */

/**
 * @typedef {Object} PluginActionContext
 * @property {Object} [context]
 * @property {Object} [payload]
 * @property {Object} [blockValues]
 */

/**
 * @template This
 * @callback PluginActionMethod
 * @this {This}
 * @param {Object} [params]
 * @param {PluginActionContext} [context]
 */

/**
 * @typedef {Object} PluginActionParameter
 * @property {'string'|'number'|'array'|'object'|'boolean'} type
 * @property {Object.<string, PluginActionParameterItem>} [properties]
 * @property {PluginActionParameterItem} [items]
 */

/**
 * @typedef {Object} PluginActionParameterItem
 * @property {string} [title]
 * @property {'string'|'number'|'array'|'object'|'boolean'|'any'|'primitives'} type
 * @property {string} [component]
 * @property {string} [group]
 * @property {Object.<string, PluginActionParameterItem>} [properties]
 * @property {PluginActionParameterItem} [items]
 * @property {boolean} [required]
 * @property {number} [maxItems]
 */

/**
 * @template {PluginData} Data
 * @template {Object.<string, Function>} Action
 * @template {Object.<string, Function>} Method
 * @typedef {Object} PluginAction
 * @property {PluginActionMethod<PluginContext<Data,Action,Method>>} method
 * @property {PluginMetadata} [metadata]
 * @property {PluginActionParameter} [parameters]
 */

/**
 * @template {Object.<string, Function>} Action
 * @template {Object.<string, Function>} Method
 * @template {PluginData} Data
 * @param {string} name
 * @param {Object} data
 * @param {PluginExport<Action>[]} [data.dependencies]
 * @param {PluginMetadata} [data.metadata]
 * @param {PluginModal} [data.models]
 * @param {Data} [data.data] - Private data that can be used within actions/setup/methods
 * @param {Method} [data.methods] - Private methods that can be used within actions/setup
 * @param {Object.<string, PluginAction<Data,Action,Method>>|Action} [data.actions] - Public methods (actions)
 * @param {Object.<string, function>} [data.tokens]
 * @param {PluginSetup<PluginContext<Data, Action, Method>, Object>} [data.setup] - Setup plugin
 */
function createPlugin (name, data) {
  const context = {}
  /**
   * @typedef {Object} Plugin
   * @property {Object} [metadata]
   * @property {PluginMetadata} metadata.plugin
   * @property {Object.<string, PluginMetadata>} [metadata.actions]
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
    metadata: {
      plugin: data.metadata
    },
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
    /** @type {Object.<string, PluginMetadata>} */
    const metadata = {}
    let hasMetadata = false
    plugin.actions = {}
    pluginData.actions = {}

    for (const key in data.actions) {
      if (Object.hasOwnProperty.call(data.actions, key)) {
        const action = data.actions[key]
        const actionContext = { context: {}, payload: {}, blockValues: {} }
        const actionName = name + '_' + key
        let method

        if (typeof action === 'object') {
          method = action.method.bind(context)

          // action metadata
          if (action.metadata) {
            hasMetadata = true
            metadata[actionName] = Object.assign({
              plugin: name
            }, action.metadata)
          }
        } else {
          method = action.bind(context)
        }

        context[key] = method

        // app actions
        pluginData.actions[actionName] = method

        // export actions
        plugin.actions[key] = (params) => {
          return method(params, actionContext)
        }
      }
    }

    if (hasMetadata) {
      plugin.metadata.actions = metadata
    }
  }

  return plugin
}

export default createPlugin
