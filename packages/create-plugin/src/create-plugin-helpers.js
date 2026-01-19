import { capitalize, deepClone } from '@dooksa/utils'
import { bindContext, dataValue } from './utils.js'
import { parseSchema } from './parse-schema.js'

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
    // usage of .apply preserves the 'this' context passed to the bridge
    return currentLogic.apply(this, args)
  }
}

/**
 * Creates and initializes the state management system.
 * State is data-driven and does not require the Bridge pattern.
 *
 * @param {Object} context - The plugin execution context
 * @param {string} name - The plugin name (used as prefix)
 * @param {import('#types').DsPluginState} state - State configuration
 * @returns {import('#types').DsPluginStateExport} Configured state object
 */
export function createPluginState (context, name, state) {
  state = deepClone(state)
  const defaults = state.defaults
  const schema = state.schema
  const _defaults = []
  const _values = {}
  const _items = []
  const _names = []

  // Internal tracking properties (non-enumerable)
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

  Object.preventExtensions(state)
  return state
}

/**
 * Registers action handlers using the Bridge pattern.
 *
 * Actions are registered into `context._impl` to allow for test interception.
 * The returned methods are "Bridges" that can be safely exported via ESM.
 *
 * @param {Object} context - The plugin execution context
 * @param {string} name - The plugin name
 * @param {import('#types').DsPluginActions} source - Action definitions
 * @param {Function} [wrapper] - Optional wrapper (e.g., mock.fn) for the implementation
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
 * @param {Object} context - The plugin execution context
 * @param {string} name - The plugin name
 * @param {import('#types').DsPluginMethods} methods - Method definitions
 * @param {Function} [wrapper] - Optional wrapper (e.g., mock.fn)
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
 * @param {import('#types').DsPluginMethods} methods - Private method definitions
 * @param {Function} [wrapper] - Optional wrapper
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
      method = wrapper(method)
    }

    // Only internal access
    context[key] = method
  }

  return [] // Private methods are never exported
}
