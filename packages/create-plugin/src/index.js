import { capitalize } from '@dooksa/utils'
import createSchema from './create-schema.js'

/**
 * @import { DataSchema } from '../../types.js'
 * @import { SchemaType, Schema } from './create-schema.js'
 */

const actionContext = {
  context: {},
  payload: {},
  blockValues: {}
}

Object.freeze(actionContext)

/**
 * @typedef {Object} PluginMetadata
 * @property {string} title
 * @property {string} [description]
 * @property {string} [icon]
 * @property {string} [component]
 */

/**
 * @typedef {Object} PluginMetadataUnique
 * @property {string} id,
 * @property {string} title
 * @property {string} [description]
 * @property {string} [icon]
 * @property {string} [component]
 */

/**
 * @typedef {Object.<string, DataSchema>} PluginSchema
 */

/**
 * @template Context
 * @callback PluginMethod
 * @this {Context}
 * @param {*} [param]
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
 * @typedef {Object} PluginAction - Dooksa function
 * @property {Function} method
 * @property {PluginMetadata|PluginMetadataUnique[]} metadata
 * @property {PluginActionParameter} [parameters]
 */

/**
 * @template {Object.<string, PluginAction>} T
 * @typedef {{ [K in keyof T]: T[K]["method"] }} PluginActionMapper
 */

/**
 * @template {Object.<string, Function>} T
 * @typedef {{ [K in keyof T]: T[K] }} PluginMethodMapper
 */

/**
 * Action named exports
 * @template {string} Name
 * @template {Object.<string, PluginAction>} Action
 * @typedef {{ [K in keyof Action as `${Name}${Capitalize<string & K>}`]: Action[K]["method"] }} PluginModuleAction
 */

/**
 * Method named exports
 * @template {string} Name
 * @template {Object.<string, Function>} Method
 * @typedef {{ [K in keyof Method as `${Name}${Capitalize<string & K>}`]: Method[K] }} PluginModuleMethod
 */

/**
 * Action for application
 * @template {string} Name
 * @template {Object.<string, PluginAction>} Action
 * @typedef {{ [K in keyof Action as `${Name}_${string & K}`]: Action[K]["method"]  } } PluginAppAction
 */

/**
 * @typedef {Object} PluginSchemaEntries
 * @property {Object.<string, ({}|[]|number|string|boolean)>} values - Initial values
 * @property {string[]} names - Name of collections
 * @property {Object[]} items
 * @property {string} items[].name
 * @property {Schema[]} items[].entries
 * @property {boolean} items[].isCollection
 */

/**
 * @typedef {Object} PluginGetters
 * @property {string} name - Plugin name
 * @property {PluginMetadata | undefined} metadata
 * @property {PluginGetters[] | undefined} dependencies
 * @property {ActiveAction[] | undefined} actions
 * @property {PluginSchema | undefined} schema - Schema for the data plugin
 * @property {PluginSchemaEntries | undefined} $schema - Optimised schema for the data plugin
 */

/**
 * @typedef {PluginGetters & Object.<string, *>} Plugin
 */

/**
 * @template {string} Name
 * @template {PluginMethods} Methods
 * @template {PluginActions} Actions
 * @template {Function} Setup
 * @typedef {PluginModuleMethod<Name, Methods> &
 *  PluginModuleAction<Name, Actions> &
 *  PluginGetters &
 *  { setup: Setup }
 * } PluginExport
 */

/**
 * @typedef {Object} ActiveAction
 * @property {string} name - Method name
 * @property {Function} method - Method
 * @property {PluginActionParameter} [parameters]
 * @property {PluginActionMetadata[]} metadata
 */

/**
 * @typedef {Object.<string, Function>} PluginMethods
 */

/**
 * @typedef {PluginMetadataUnique & { plugin: string, method: string }} PluginActionMetadata
 * @typedef {Object.<string, PluginAction>} PluginActions
 * @typedef {Object.<string, *>} PluginData
 */

/**
 * @template {string} Name
 * @template {PluginData} Data
 * @template {PluginMethods} Methods
 * @template {PluginActions} Actions
 * @template {Function} Setup
 * @typedef {Object} PluginOptions
 * @property {PluginGetters[]} [plugin.dependencies]
 * @property {PluginSchema} [plugin.schema]
 * @property {PluginMetadata} [plugin.metadata]
 * @property {Data} [data]
 * @property {Methods} [methods]
 * @property {Actions} [actions]
 * @property {Setup} [setup]
 */

/**
 * @template {string} Name
 * @template {PluginData} Data
 * @template {PluginMethods} Methods
 * @template {PluginActions} Actions
 * @template {Function} Setup
 * @param {Name} name
 * @param {PluginOptions<
 *    Name,
 *    Data,
 *    Methods,
 *    Actions,
 *    Setup
 *  > &
 *  ThisType<
 *    { name: Name } &
 *    Data &
 *    Methods &
 *    PluginActionMapper<Actions>
 *  >} plugin
 * @returns {PluginExport<Name, Methods, Actions, Setup>}
 */
export default function createPlugin (name, {
  dependencies,
  schema,
  metadata,
  data,
  actions,
  methods,
  setup
}) {
  const context = Object.create(null)
  /** @type {PluginSchemaEntries} */
  let $schema

  // add plugin name to context
  context.name = name

  // bind context to setup
  if (typeof setup === 'function') {
    setup = setup.bind(context)
  }

  if (schema) {
    $schema = {
      values: {},
      items: [],
      names: []
    }

    for (const key in schema) {
      if (Object.hasOwnProperty.call(schema, key)) {
        const item = schema[key]
        const schemaType = item.type

        // data namespace
        const collectionName = name + '/' + key

        $schema.values[collectionName] = dataValue(schemaType)
        $schema.names.push(collectionName)
        $schema.items.push({
          name: collectionName,
          entries: createSchema(context, item, collectionName),
          isCollection: schemaType === 'collection'
        })
      }
    }
  }

  /**
   * Active actions
   * @type {ActiveAction[]}
   */
  const _actions = []
  /**
   * @type {PluginExport<Name, Methods, Actions, Setup>}
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
    get schema () {
      return schema
    },
    get $schema () {
      return $schema
    },
    get actions () {
      return _actions
    },
    get setup () {
      return setup
    }
  }

  if (data) {
    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        let item = data[key]

        // set data context
        context[key] = item
      }
    }
  }

  if (actions) {
    // map actions
    for (const key in actions) {
      if (Object.prototype.hasOwnProperty.call(actions, key)) {
        if (context[key]) {
          throw new Error(`Plugin [${key}]: Expected unique action name`)
        }

        const action = actions[key]
        const actionModuleName = name + capitalize(key)
        const actionName = name + '_' + key
        const method = action.method.bind(context)

        context[key] = action.method
        result[actionModuleName] = (params) => {
          return method(params, actionContext)
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
      if (context[key]) {
        throw new Error(`Plugin [${key}]: Expected unique method name`)
      }

      const action = methods[key]
      const methodName = name + capitalize(key)

      context[key] = action
      result[methodName] = action.bind(context)
    }
  }

  return result
}

/**
 * @param {SchemaType} type
 */
function dataValue (type) {
  let value

  switch (type) {
    case 'collection':
      value = {}
      break
    case 'object':
      value = {}
      break
    case 'array':
      value = []
      break
    case 'string':
      value = ''
      break
    case 'number':
      value = 0
      break
    case 'boolean':
      value = true
      break
    default:
      throw new Error('DooksaError: Unexpected data model "' + type + '"')
  }

  return value
}
