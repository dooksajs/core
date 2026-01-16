import { capitalize, deepClone } from '@dooksa/utils'
import { parseSchema } from './parse-schema.js'

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

/**
 *
 * @param {*} value
 * @returns
 */
function isPlainObject (value) {
  if (value === null || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  return proto === null || proto === Object.prototype
}

/**
 * @param {any} target - The object/function to bind
 * @param {any} context - The 'this' context to apply
 * @param {WeakMap} seen - Internal tracker for circular references
 */
function bindContext (target, context, seen = new WeakMap()) {
  // Handle Functions: Bind and return
  if (typeof target === 'function') {
    return target.bind(context)
  }

  // Handle Primitives and "Special" Objects (Date, RegExp, etc.)
  if (
    !target
    || typeof target !== 'object'
    || (
      !isPlainObject(target)
      && !Array.isArray(target)
    )
  ) {
    return target
  }

  // Circular Reference Check: If we've seen this object, return the bound version
  if (seen.has(target)) {
    return seen.get(target)
  }

  // Prepare the container (Array or Null-Prototype Object)
  const isArray = Array.isArray(target)
  const boundClone = isArray ? [] : Object.create(null)

  // Store the mapping BEFORE recursing to catch deep circularity
  seen.set(target, boundClone)

  // Recurse through keys
  const keys = isArray ? target.keys() : Object.keys(target)

  for (const key of keys) {
    const value = target[key]
    // Recursively bind children
    boundClone[key] = bindContext(value, context, seen)
  }

  return boundClone
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
  /** @type {DsPluginExport<Name, Methods, Actions, Setup>} */
  const result = {}
  const context = Object.create(null)

  // add plugin name to context
  context.name = name

  // bind context to setup
  setup = bindContext(setup, context)

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

    if (defaults) {
      for (const [key, value] of Object.entries(defaults)) {
        _defaults.push({
          name: name + '/' + key,
          value: bindContext(value, context)
        })
      }
    }


    for (const [key, value] of Object.entries(schema)) {
      const schemaType = value.type
      const collectionName = name + '/' + key

      _values[collectionName] = dataValue(schemaType)
      _names.push(collectionName)
      _items.push({
        entries: parseSchema(context, value, collectionName),
        isCollection: schemaType === 'collection',
        name: collectionName
      })
    }
  }

  /**
   * Active actions
   * @type {ActiveAction[]}
   */
  const _actions = []

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

    // set data context
    for (const [key, value] of Object.entries(data)) {
      context[key] = value
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

  const restorationData = data ? deepClone(data) : {}

  Object.defineProperty(result, 'restore', {
    value () {
      Object.assign(context, restorationData)
    },
    enumerable: false,
    writable: false,
    configurable: false
  })

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
