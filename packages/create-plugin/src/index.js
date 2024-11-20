/** @import {DataSchema} from '../../types.js' */

const actionContext = {
  context: {},
  payload: {},
  blockValues: {}
}

Object.freeze(actionContext)

/**
 * @typedef {Object} PluginMetadata
 * @property {string} title
 * @property {string} description
 * @property {string} icon
 * @property {string} [component]
 */

/**
 * @typedef {Object} PluginMetadataUnique
 * @property {string} id,
 * @property {string} title
 * @property {string} description
 * @property {string} icon
 * @property {string} [component]
 */

/**
 * @typedef {Object.<string, DataSchema>} PluginModal
 */

/**
 * @template This
 * @callback PluginSetup
 * @this {This}
 * @param {*} param
 */

/**
 * @typedef {number|string|boolean|MutationObserver} PluginDataTypes
 * @typedef {Object.<string, PluginDataTypes|PluginDataTypes[]|Object.<string,PluginDataTypes>|Object.<string,PluginDataTypes>[]>} PluginData
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
 * @typedef {Object} PluginAction - Dooksa function
 * @property {Function} method
 * @property {PluginMetadata|PluginMetadataUnique[]} metadata
 * @property {PluginActionParameter} [parameters]
 */

/**
 * @template {Object.<string, PluginAction>} Action
 * @typedef {{ [K in keyof Action]: Action[K]["method"] }} PluginActionMapper
 */

/**
 * Namespaced actions
 * @template {string} Name
 * @template {Object.<string, PluginAction>} Action
 * @typedef {{ [K in keyof Action as `${Name}${Capitalize<string & K>}`]?: Action[K]["method"] }} PluginModuleAction
 */

/**
 * Namespaced plugin actions
 * @template {string} Name
 * @template {Object.<string, PluginAction>} Action
 * @typedef {{ [K in keyof Action as `${Name}_${string & K}`]?: Action[K]["method"] }} PluginSystemAction
 */

/**
 * Namespaced action methods
 * @template {string} Name
 * @template {Object.<string, Function>} Method
 * @typedef {{ [K in keyof Method as `${Name}${Capitalize<string & K>}`]?: Method[K] }} PluginModuleMethod
 */

/**
 * @template {string} Name
 * @template {Object.<string, PluginAction>} Action
 * @template {Object.<string, Function>} Method
 * @typedef {PluginModuleAction<Name, Action> & PluginModuleMethod<Name, Method>} PluginMethods
 */

/**
 * @typedef {Object} PluginActions
 * @property {Object} [methods]
 * @property {Object.<string, PluginMetadata>} [metadata]
 * @property {Object} [parameters]
 */

/**
 * @typedef {Object} Plugin
 * @property {string} name - Plugin name
 * @property {PluginMetadata} metadata
 * @property {Plugin[] | undefined} dependencies
 * @property {ActiveAction[]} actions


 * @property {Function | undefined} setup
 * @property {PluginModal | undefined} models
 */

/**
 * @typedef {Object} ActiveAction
 * @property {string} name - Method name
 * @property {Function} method - Method
 * @property {PluginActionParameter} [parameters]
 * @property {PluginActionMetadata[]} metadata
 */

/**
 * @typedef {PluginMetadataUnique & { plugin: string, method: string }} PluginActionMetadata
 */

/**
 * Uppercase first letter
 * @param {string} string
 */
function capitalize (string) {
  return string[0].toUpperCase() + string.slice(1)
}

/**
 * @template {string} Name
 * @template {Object.<string, Function>} Method
 * @template {Object.<string, PluginAction>} Action
 * @template {PluginData} Data
 * @param {Name} name
 * @param {Object} plugin
 * @param {PluginModal} [plugin.models]
 * @param {Plugin[]} [plugin.dependencies]
 * @param {PluginMetadata} [plugin.metadata]
 * @param {Data} [plugin.data] - Private data that can be used within actions/setup
 * @param {Action} [plugin.actions]
 * @param {Method} [plugin.methods]
 * @param {PluginSetup<Method & PluginActionMapper<Action>>} [plugin.setup]
 */
export default function createPlugin (name, {
  dependencies,
  models,
  metadata,
  data,
  actions,
  methods,
  setup
}) {
  const context = Object.create(null)

  context.name = name

  // bind context to setup
  if (typeof setup === 'function') {
    setup = setup.bind(context)
  }

  /**
   * Active actions
   * @type {ActiveAction[]}
   */
  const _actions = []
  /**
   * @type {PluginMethods<Name, Action, Method> & Plugin}
   */
  const result = {
    get name () {
      return name
    },
    get dependencies () {
      return dependencies
    },
    get metadata () {
      return metadata
    },
    get models () {
      return models
    },
    get actions () {
      return _actions
    },
    get setup () {
      return setup
    }
  }

  if (data) {
    mergeContextProperties(data, context)
  }

  if (actions) {
    // map actions
    for (const key in actions) {
      if (Object.prototype.hasOwnProperty.call(actions, key)) {
        const action = actions[key]
        const actionModuleName = name + capitalize(key)
        const actionName = name + '_' + key
        const method = action.method.bind(context)

        context[key] = action.method
        result[actionModuleName] = (params, context = actionContext) => {
          return method(params, context)
        }

        /** @type {PluginActionMetadata[]} */
        const metadata = []

        if (Array.isArray(action.metadata)) {
          for (let i = 0; i < action.metadata.length; i++) {
            const actionMetadata = action.metadata[i]
            metadata.push(Object.assign({
              plugin: name,
              method: actionName
            }, actionMetadata))
          }
        } else {
          metadata.push(Object.assign({
            id: 'default',
            plugin: name,
            method: actionName
          }, action.metadata))
        }

        /** @type {ActiveAction} */
        const actionItem = {
          name: actionName,
          method,
          metadata
        }

        if (action.parameters) {
          actionItem.parameters = action.parameters
        }

        _actions.push(actionItem)
      }
    }
  }

  // map methods to result
  for (const key in methods) {
    if (Object.prototype.hasOwnProperty.call(methods, key)) {
      const action = methods[key]
      const methodName = name + capitalize(key)

      if (result.hasOwnProperty(methodName)) {
        throw new Error(`Plugin [${name}]: Expected unique method name but found: ${methodName}`)
      }

      context[key] = action
      result[methodName] = action.bind(context)
    }
  }

  return result
}

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
