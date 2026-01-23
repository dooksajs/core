import { capitalize, deepClone } from '@dooksa/utils'
import { bindContext, dataValue } from './utils.js'
import { parseSchema } from './parse-schema.js'

/**
 * @import {DsPluginStateExport, DsPluginActions, DsPluginState, DsPluginMethods, DsPluginSchemaDefaults} from '#types'
 * @import {Mock, MockFunctionContext} from 'node:test'
 */

/**
 * @callback WrapperCallback
 * @param {Function} fn - Function to wrap
 * @returns {Mock<Function>} Wrapped function
 */

/**
 * @callback PrivateMethodWrapperCallback
 * @param {string} key - Method key
 * @param {Function} fn - Function to wrap
 * @returns {Mock<Function>} Wrapped function
 */

/**
 * @template {Function} T = Function
 * @typedef {Object} PluginActionResult
 * @property {Object[]} methods - Exported methods
 * @property {string} methods[].name - Method name
 * @property {T} methods[].value - Method function
 * @property {Object[]} actions - Action metadata
 * @property {string} actions[].key - Action key
 * @property {string} actions[].name - Action name
 * @property {T} actions[].method - Action method
 * @property {Object[]} actions[].metadata - Action metadata
 * @property {Object} [actions[].parameters] - Action parameters
 */

/**
 * @template {Function} T = Function
 * @typedef {Object} PluginMethodResult
 * @property {string} key - Internal key (for registry lookup)
 * @property {string} name - Public name (for export)
 * @property {T} value - Method function
 */

/**
 * @internal
 * Ensures the internal implementation registry exists on the context.
 * This registry (`_impl`) is the "live heart" of the plugin where actual logic resides.
 *
 * @param {Object} context - The plugin execution context
 */
function ensureImplRegistry (context) {
  if (!context._impl) {
    context._impl = Object.create(null)
  }
}

/**
 * @internal
 * Creates a stable "Bridge" function.
 *
 * The returned function is a permanent proxy. When called, it looks up the
 * current implementation in `context._impl[key]` and executes it.
 * This allows us to hot-swap the logic (e.g., for mocking) without changing
 * the exported function reference held by other modules.
 *
 * @param {Object} context - The plugin context containing the `_impl` registry
 * @param {string} key - The method name to look up
 * @returns {Function} A stable function that delegates to the current implementation
 */
function createBridge (context, key) {
  return function (...args) {
    const currentLogic = context._impl[key]

    if (typeof currentLogic !== 'function') {
      throw new Error(`Implementation for [${key}] is not a function.`)
    }

    return currentLogic.apply(this, args)
  }
}

/**
 * Creates and initializes the state management system.
 * State is data-driven and does not require the Bridge pattern.
 *
 * @param {Object} context - The plugin execution context
 * @param {string} name - The plugin name (used as prefix)
 * @param {DsPluginState} state - State configuration
 * @returns {DsPluginStateExport} Configured state object
 */
export function createPluginState (context, name, state) {
  const clonedState = deepClone(state)
  const defaults = clonedState.defaults
  const schema = clonedState.schema
  const _defaults = []
  /** @type {DsPluginSchemaDefaults} */
  const _values = {}
  const _items = []
  const _names = []

  // Process defaults
  if (defaults) {
    for (const [key, value] of Object.entries(defaults)) {
      _defaults.push({
        name: name + '/' + key,
        value: bindContext(value, context)
      })
    }
  }

  // Process schema
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

  // Create the state export object with all properties
  const stateExport = {
    schema,
    defaults,
    _values,
    _names,
    _items,
    _defaults
  }

  // Define Property Descriptors
  const propertyDescriptorValues = {
    configurable: false,
    enumerable: false,
    writable: false
  }

  Object.defineProperties(stateExport, {
    schema: propertyDescriptorValues,
    defaults: propertyDescriptorValues,
    _values: propertyDescriptorValues,
    _names: propertyDescriptorValues,
    _items: propertyDescriptorValues,
    _defaults: propertyDescriptorValues
  })

  Object.preventExtensions(stateExport)
  return stateExport
}

/**
 * Registers action handlers using the Bridge pattern.
 *
 * Actions are registered into `context._impl` to allow for test interception.
 * The returned methods are "Bridges" that can be safely exported via ESM.
 *
 * @overload
 * @param {Object} context - The plugin execution context
 * @param {string} name - The plugin name
 * @param {DsPluginActions} source - Action definitions
 * @returns {PluginActionResult<Function>} Object containing methods and actions
 *
 * @overload
 * @param {Object} context - The plugin execution context
 * @param {string} name - The plugin name
 * @param {DsPluginActions} source - Action definitions
 * @param {WrapperCallback} wrapper - Wrapper (e.g., mock.fn) for the implementation
 * @returns {PluginActionResult<Mock<Function>>} Object containing methods and actions
 *
 * @param {Object} context - The plugin execution context
 * @param {string} name - The plugin name
 * @param {DsPluginActions} source - Action definitions
 * @param {WrapperCallback} [wrapper] - Optional wrapper (e.g., mock.fn) for the implementation
 * @returns {PluginActionResult<Function | Mock<Function>>} Object containing methods and actions
 */
export function createPluginActions (context, name, source, wrapper) {
  ensureImplRegistry(context)
  const methods = []
  const actions = []

  const actionContext = Object.create(null, {
    context: {
      value: {},
      writable: false,
      enumerable: true,
      configurable: false
    },
    payload: {
      value: {},
      writable: false,
      enumerable: true,
      configurable: false
    },
    blockValues: {
      value: {},
      writable: false,
      enumerable: true,
      configurable: false
    }
  })
  Object.preventExtensions(actionContext)

  for (const [key, action] of Object.entries(source)) {
    if (context[key]) {
      throw new Error(`Plugin Action [${key}]: Expected unique name`)
    }

    const actionModuleName = name + capitalize(key)
    const actionName = name + '_' + key

    // Store the actual logic in the mutable registry
    context._impl[key] = action.method

    // Create the stable Bridge and bind it to context
    let method = createBridge(context, key).bind(context)

    // Apply wrapper if provided (used during createObservableInstance)
    if (wrapper) {
      method = wrapper(method)
    }

    // Register bound bridge on context for internal usage (this.actionName())
    context[key] = method

    // Exported method wrapper that injects actionContext
    methods.push({
      name: actionModuleName,
      value (params) {
        return method(params, actionContext)
      }
    })

    // Metadata processing
    const metadata = []
    if (Array.isArray(action.metadata)) {
      for (const item of action.metadata) {
        metadata.push(Object.assign({
          plugin: name,
          method: actionName
        }, item))
      }
    } else {
      metadata.push(Object.assign({
        id: 'default',
        plugin: name,
        method: actionName
      }, action.metadata))
    }

    actions.push({
      key,
      name: actionName,
      method,
      metadata,
      ...(action.parameters && { parameters: action.parameters })
    })
  }

  return {
    methods,
    actions
  }
}

/**
 * Registers public methods using the Bridge pattern.
 *
 * @overload
 * @param {Object} context - The plugin execution context
 * @param {string} name - The plugin name
 * @param {DsPluginMethods} methods - Method definitions
 * @returns {PluginMethodResult<Function>[]} Array of method objects
 *
 * @overload
 * @param {Object} context - The plugin execution context
 * @param {string} name - The plugin name
 * @param {DsPluginMethods} methods - Method definitions
 * @param {WrapperCallback} wrapper - Wrapper (e.g., mock.fn)
 * @returns {PluginMethodResult<Mock<Function>>[]} Array of method objects
 *
 * @param {Object} context - The plugin execution context
 * @param {string} name - The plugin name
 * @param {DsPluginMethods} methods - Method definitions
 * @param {WrapperCallback} [wrapper] - Optional wrapper (e.g., mock.fn)
 * @returns {PluginMethodResult<Function | Mock<Function>>[]} Array of method objects
 */
export function createPluginMethods (context, name, methods, wrapper) {
  ensureImplRegistry(context)
  const results = []

  for (const [key, value] of Object.entries(methods)) {
    if (context[key]) {
      throw new Error(`Plugin Method [${key}]: Expected unique name`)
    }

    // Store logic in mutable registry
    context._impl[key] = value

    // Create and bind stable Bridge
    let method = createBridge(context, key).bind(context)

    if (wrapper) {
      method = wrapper(method)
    }

    // Internal access
    context[key] = method

    // External access (Standardized naming)
    results.push({
      key, // Internal key (for registry lookup)
      name: name + capitalize(key), // Public name (for export)
      value: method
    })
  }

  return results
}

/**
 * Registers private methods using the Bridge pattern.
 * Private methods are not exported but are still bridged to allow
 * for internal spying/mocking during tests.
 *
 * @param {Object} context - The plugin execution context
 * @param {DsPluginMethods} methods - Private method definitions
 * @param {PrivateMethodWrapperCallback} [wrapper] - Optional wrapper
 */
export function createPluginPrivateMethods (context, methods, wrapper) {
  ensureImplRegistry(context)

  for (const [key, value] of Object.entries(methods)) {
    if (context[key]) {
      throw new Error(`Plugin Private Method [${key}]: Expected unique name`)
    }

    // Store logic
    context._impl[key] = value

    // Create Bridge
    let method = createBridge(context, key).bind(context)

    if (wrapper) {
      method = wrapper(key, method)
    }

    // Only internal access
    context[key] = method
  }
}
