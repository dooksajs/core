
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
 * @property {string} [component]
 */

/**
 * @typedef {number|string|boolean|MutationObserver} PluginDataTypes
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
 * @property {Object} [metadata]
 * @property {PluginMetadata} metadata.plugin
 * @property {Object.<string, PluginMetadata>} [metadata.actions]
 * @property {Object} [metadata.actionParameters]
 * @property {Object} [metadata.actionSchemas]
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
 * @property {'string'|'number'|'array'|'object'|'boolean'} [type]
 * @property {Object.<string, PluginActionParameterItem>} [properties]
 * @property {PluginActionParameterItem} [items]
 */

/**
 * @typedef {Object} PluginActionParameterItem
 * @property {string} [title]
 * @property {'string'|'number'|'array'|'object'|'boolean'|'any'|'primitives'} type
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
 * @property {PluginMetadata|PluginMetadata[]} [metadata]
 * @property {PluginActionParameter} [parameters]
 */

/**
 * @template {string} Name
 * @template {Object.<string, Function>} Action
 * @template {Object.<string, Function>} Method
 * @template {PluginData} Data
 * @param {Name} name
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
   * @property {Object} [tokens]
   * @property {PluginSetup<PluginContext<Data, Action, Method>, Object>} [setup]
   * @property {Object.<string, Function>} [actions]
   */

  /** @type {Plugin} */
  const pluginInit = {}
  const metadata = { plugin: data.metadata }

  /**
   * @type {PluginExport<Action>}
   */
  const pluginExport = {
    name,
    metadata,
    initialise () {
      return pluginInit
    }
  }

  if (data.data) {
    mergeContextProperties(data.data, context)
  }

  if (data.methods) {
    mergeContextProperties(data.methods, context)
  }

  if (data.models) {
    pluginExport.models = data.models
  }

  if (data.tokens) {
    pluginInit.tokens = mergeContextProperties(data.tokens, context)
  }

  if (data.setup) {
    pluginInit.setup = data.setup.bind(context)
  }

  if (data.actions) {
    /** @type {Object.<string, PluginMetadata>} */
    const metadata = {}
    const schemas = {}
    let hasMetadata = false
    let hasParameters = false

    pluginExport.actions = {}
    pluginInit.actions = {}

    for (const key in data.actions) {
      if (Object.hasOwnProperty.call(data.actions, key)) {
        const action = data.actions[key]
        const actionContext = {
          context: {},
          payload: {},
          blockValues: {}
        }
        const actionName = name + '_' + key
        let method

        if (typeof action === 'object') {
          method = action.method.bind(context)

          // action metadata
          if (action.metadata) {
            hasMetadata = true

            // append plugin/method data to action metadata
            if (Array.isArray(action.metadata)) {
              for (let i = 0; i < action.metadata.length; i++) {
                metadata[actionName + '__' + i] = Object.assign({
                  plugin: name,
                  method: actionName
                }, action.metadata[i])
              }
            } else {
              metadata[actionName] = Object.assign({
                plugin: name,
                method: actionName
              }, action.metadata)
            }
          }

          if (action.parameters) {
            hasParameters = true
            schemas[actionName] = action.parameters
          }
        } else {
          method = action.bind(context)
        }

        context[key] = method

        // app actions
        pluginInit.actions[actionName] = method

        // export actions
        pluginExport.actions[key] = (params) => {
          return method(params, actionContext)
        }
      }
    }

    if (hasMetadata) {
      pluginExport.metadata.actions = metadata
    }

    if (hasParameters) {
      pluginExport.metadata.actionSchemas = schemas
    }
  }

  return pluginExport
}

export default createPlugin
