
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
 * @property {PluginActionParameterComponent} [component]
 */

/**
 * @typedef {Object} PluginActionParameterItem
 * @property {string} [title]
 * @property {'string'|'number'|'array'|'object'|'boolean'|'any'|'primitives'} type
 * @property {PluginActionParameterComponent} [component]
 * @property {string} [group]
 * @property {Object.<string, PluginActionParameterItem>} [properties]
 * @property {PluginActionParameterItem} [items]
 * @property {boolean} [required]
 * @property {number} [maxItems]
 */

/**
 * @typedef {Object} PluginActionParameterComponent
 * @property {string} title
 * @property {string} id
 * @property {string} [group]
 * @property {number} [order]
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
 * Extract component data from parameter schema
 * @param {PluginActionParameter|PluginActionParameterItem} params
 * @param {Object} [entry={}]
 * @param {Object[]} [results=[]]
 * @param {Object} [groups={}]
 * @param {boolean} [isHead=true]
 */
function parseParameters (
  params,
  entry = {},
  results = [],
  groups = {},
  isHead = true
) {
  switch (params.type) {
    case 'object': {
      const props = params.properties

      for (const key in props) {
        const component = props[key].component
        const item = {}

        if (component) {
          if (component.group) {
            const groupId = component.group
            let group = groups[groupId]

            if (!group) {
              groups[groupId] = {
                title: groupId,
                items: []
              }
              group = groups[groupId]
              results.push(group)
            }

            group.items.push(item)
          } else if (component.title) {
            entry = {
              title: component.title,
              items: []
            }

            results.push(entry)
            entry.items.push(item)
          } else {
            throw new Error('Component missing title property')
          }
        }

        parseParameters(props[key], item, results, groups, false)
      }

      break
    }
    case 'array': {
      if (!params.items) {
        throw new Error('Action schema type "array" expects property "items" but found none')
      }
      const component = params.items.component

      if (!component) {
        break
      }

      const item = {}

      if (component.group) {
        const groupId = component.group
        let group = groups[groupId]

        if (!group) {
          groups[groupId] = {
            title: groupId,
            items: []
          }
          group = groups[groupId]
          results.push(group)
        }

        group.items.push(item)
      } else if (component.title) {
        entry = {
          title: component.title,
          items: []
        }

        results.push(entry)
        entry.items.push(item)
      }

      parseParameters(params.items, item, results, groups, false)
      break
    }
    default:
      const component = params.component

      if (!component) {
        break
      }

      const title = component.title
      const id = component.id

      if (!title) {
        throw new Error('Component missing title property')
      }

      if (!id) {
        throw new Error('Component missing id property')
      }

      // update metadata entry
      entry.title = title

      if (isHead) {
        entry.items = [{ id, title }]

        results.push(entry)
      } else {
        entry.id = id
      }

      // remove component property from schema
      delete params.component

      break
  }

  return results
}


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
    const parameters = {}
    const schemas = {}
    let hasMetadata = false
    let hasParameters = false

    pluginExport.actions = {}
    pluginInit.actions = {}

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

          if (action.parameters) {
            hasParameters = true
            parameters[actionName] = parseParameters(action.parameters)
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
      pluginExport.metadata.actionParameters = parameters
      pluginExport.metadata.actionSchemas = schemas
    }
  }

  return pluginExport
}

export default createPlugin
