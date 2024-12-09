import { capitalize, deepClone } from '@dooksa/utils'
import { createSchema } from './create-schema.js'

/**
 * @import {
 *  PluginData,
 *  PluginMethods,
 *  PluginActions,
 *  PluginOptions,
 *  PluginActionMapper,
 *  PluginExport,
 *  ActiveAction,
 *  PluginActionMetadata,
 *  SchemaType } from '#types'
 */

const actionContext = {
  context: {},
  payload: {},
  blockValues: {}
}

Object.freeze(actionContext)

/**
 * @template {string} Name
 * @template {PluginData} Data
 * @template {PluginMethods} Methods
 * @template {PluginMethods} PrivateMethods
 * @template {PluginActions} Actions
 * @template {Function} Setup
 * @param {Name} name
 * @param {PluginOptions<
 *    Name,
 *    Data,
 *    Methods,
 *    PrivateMethods,
 *    Actions,
 *    Setup
 *  > &
 *  ThisType<
 *    { name: Name } &
 *    Data &
 *    Methods &
 *    PrivateMethods &
 *    PluginActionMapper<Actions>
 *  >} plugin
 * @returns {PluginExport<Name, Methods, Actions, Setup>}
 */
export function createPlugin (name, {
  dependencies,
  state,
  metadata,
  data,
  actions,
  methods,
  privateMethods,
  setup
}) {
  const context = Object.create(null)

  // add plugin name to context
  context.name = name

  // bind context to setup
  if (typeof setup === 'function') {
    setup = setup.bind(context)
  }

  if (state) {
    state = deepClone(state)

    const defaults = state.defaults
    const schema = state.schema
    const values = {}
    const items = []
    const names = []

    Object.defineProperties(state, {
      items: {
        get () {
          return items
        }
      },
      names: {
        get () {
          return names
        }
      },
      schema: {
        get () {
          return schema
        }
      },
      values: {
        get () {
          return values
        }
      },
      defaults: {
        get () {
          return defaults
        }
      }
    })

    for (const key in schema) {
      if (Object.hasOwnProperty.call(schema, key)) {
        const item = schema[key]
        const schemaType = item.type
        // data namespace
        const collectionName = name + '/' + key

        values[collectionName] = dataValue(schemaType)

        names.push(collectionName)
        items.push({
          entries: createSchema(context, item, collectionName),
          isCollection: schemaType === 'collection',
          name: collectionName
        })
        values[collectionName] = dataValue(schemaType)
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
    get state () {
      return state
    },
    get actions () {
      return _actions
    },
    get setup () {
      return setup
    }
  }

  if (data) {
    data = deepClone(data)

    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        // set data context
        context[key] = data[key]
      }
    }
  }

  // map actions
  if (actions) {
    for (const key in actions) {
      if (Object.prototype.hasOwnProperty.call(actions, key)) {
        if (context[key]) {
          throw new Error(`Plugin [${key}]: Expected unique action name`)
        }

        const action = actions[key]
        const actionModuleName = name + capitalize(key)
        const actionName = name + '_' + key
        const method = action.method.bind(context)

        // bind context to method
        context[key] = method

        // mocks action call
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
  if (methods) {
    for (const key in methods) {
      if (Object.prototype.hasOwnProperty.call(methods, key)) {
        if (context[key]) {
          throw new Error(`Plugin [${key}]: Expected unique method name`)
        }

        const method = methods[key].bind(context)
        const methodName = name + capitalize(key)

        // add method to context
        context[key] = method

        // add method to result
        result[methodName] = method
      }
    }
  }


  if (privateMethods) {
    for (const key in privateMethods) {
      if (Object.prototype.hasOwnProperty.call(privateMethods, key)) {
        if (context[key]) {
          throw new Error(`Plugin [${key}]: Expected unique private method name`)
        }

        // bind context to private methods
        context[key] = privateMethods[key].bind(context)
      }
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
      throw new Error('DooksaError: Unexpected data schema "' + type + '"')
  }

  return value
}
