import { capitalize, deepClone } from '@dooksa/utils'
import { createSchema } from './create-schema.js'

/**
 * @import {
 *  DsPluginData,
 *  DsPluginMethods,
 *  DsPluginActions,
 *  DsPluginOptions,
 *  DsPluginActionMapper,
 *  DsPluginExport,
 *  DsPluginActionMetadata,
 *  ActiveAction,
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
 * @template {DsPluginData} Data
 * @template {DsPluginMethods} Methods
 * @template {DsPluginMethods} PrivateMethods
 * @template {DsPluginActions} Actions
 * @template {Function} Setup
 * @param {Name} name
 * @param {DsPluginOptions<
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
 *    DsPluginActionMapper<Actions>
 *  >} plugin
 * @returns {DsPluginExport<Name, Methods, Actions, Setup>}
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
    const _defaults = []
    const _values = {}
    const _items = []
    const _names = []

    Object.defineProperties(state, {
      _items: {
        value: _items,
        enumerable: false
      },
      _names: {
        value: _names,
        enumerable: false
      },
      _values: {
        value: _values,
        enumerable: false
      },
      _defaults: {
        value: _defaults,
        enumerable: false
      }
    })

    for (const key in defaults) {
      if (Object.prototype.hasOwnProperty.call(defaults, key)) {
        // @TODO could validate
        _defaults.push({
          name: name + '/' + key,
          value: defaults[key]
        })
      }
    }

    for (const key in schema) {
      if (Object.hasOwnProperty.call(schema, key)) {
        const item = schema[key]
        const schemaType = item.type
        // data namespace
        const collectionName = name + '/' + key

        _values[collectionName] = dataValue(schemaType)

        _names.push(collectionName)
        _items.push({
          entries: createSchema(context, item, collectionName),
          isCollection: schemaType === 'collection',
          name: collectionName
        })
        _values[collectionName] = dataValue(schemaType)
      }
    }
  }

  /**
   * Active actions
   * @type {ActiveAction[]}
   */
  const _actions = []
  /**
   * @type {DsPluginExport<Name, Methods, Actions, Setup>}
   */
  const result = {}

  Object.defineProperties(result, {
    name: {
      value: name,
      enumerable: false
    },
    dependencies: {
      value: dependencies,
      enumerable: false
    },
    metadata: {
      value: metadata,
      enumerable: false
    },
    state: {
      value: state,
      enumerable: false
    },
    actions: {
      value: _actions,
      enumerable: false
    },
    setup: {
      value: setup,
      enumerable: false
    }
  })

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

        /** @type {DsPluginActionMetadata[]} */
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
