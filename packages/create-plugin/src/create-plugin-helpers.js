import { capitalize, deepClone } from '@dooksa/utils'
import { bindContext, dataValue } from './utils.js'
import { parseSchema } from './parse-schema.js'

/**
 * @import { DsPluginStateExport, DsPluginState, ActiveAction, DsPluginMethods } from '#types'
 */

/**
 * Creates and initializes the state management system for a plugin.
 *
 * This function processes the state configuration, creates default values,
 * validates schemas, and sets up the internal state structure with
 * non-enumerable properties for internal tracking.
 *
 * @param {Object} context - The plugin execution context
 * @param {string} name - The plugin name (used as prefix for state keys)
 * @param {DsPluginState} state - State configuration object
 * @returns {DsPluginStateExport} - Configured state object with internal tracking properties
 *
 * @example
 * // Basic state with defaults and schema
 * const context = { name: 'user' }
 * const state = createPluginState(context, 'user', {
 *   defaults: {
 *     count: 0,
 *     isActive: true
 *   },
 *   schema: {
 *     count: { type: 'number' },
 *     isActive: { type: 'boolean' }
 *   }
 * })
 * // Result: state has properties like 'user/count' and 'user/isActive'
 *
 * @example
 * // State with collection type
 * const state = createPluginState(context, 'products', {
 *   schema: {
 *     items: { type: 'collection' }
 *   }
 * })
 * // Result: state.items will be a collection type
 */
export function createPluginState (context, name, state) {
  // Deep clone state to prevent mutations
  state = deepClone(state)

  const defaults = state.defaults
  const schema = state.schema
  const _defaults = []
  const _values = {}
  const _items = []
  const _names = []

  // Define non-enumerable internal properties for state tracking
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

  // Process default values and bind them to plugin context
  if (defaults) {
    for (const [key, value] of Object.entries(defaults)) {
      _defaults.push({
        name: name + '/' + key,
        value: bindContext(value, context)
      })
    }
  }

  // Process schema and initialize state values
  for (const [key, value] of Object.entries(schema)) {
    const schemaType = value.type
    const collectionName = name + '/' + key

    // Initialize data value based on schema type
    _values[collectionName] = dataValue(schemaType)
    _names.push(collectionName)

    // Parse schema entries for complex types
    _items.push({
      entries: parseSchema(context, value, collectionName),
      isCollection: schemaType === 'collection',
      name: collectionName
    })
  }

  // Freeze state to prevent runtime modifications
  Object.preventExtensions(state)

  return state
}


/**
 * Creates and registers action handlers for a plugin.
 *
 * This function processes action definitions, binds them to the plugin context,
 * creates action metadata, and returns both the action handlers and their
 * corresponding method modules for export.
 *
 * @param {Object} context - The plugin execution context
 * @param {string} name - The plugin name (used as prefix for action names)
 * @param {import('#types').DsPluginActions} source - Action definitions object
 * @param {Function} [wrapper] - Optional wrapper function to wrap action methods
 * @returns {{ methods: Array<{ name: string, value: Function }>, actions: ActiveAction[] }} -
 *         Object containing action methods and action metadata
 *
 * @example
 * // Basic action with metadata
 * const context = { name: 'auth' }
 * const result = createPluginActions(context, 'auth', {
 *   login: {
 *     method: function(params) {
 *       this.token = params.token
 *     },
 *     metadata: {
 *       title: 'User Login',
 *       description: 'Authenticate user and store token'
 *     }
 *   }
 * })
 * // Result: result.methods contains 'authLogin' function
 * //         result.actions contains action metadata
 *
 * @example
 * // Action with parameters
 * const result = createPluginActions(context, 'user', {
 *   updateProfile: {
 *     method: function(params) {
 *       this.name = params.name
 *     },
 *     metadata: {
 *       title: 'Update Profile'
 *     },
 *     parameters: {
 *       type: 'object',
 *       properties: {
 *         name: { type: 'string', required: true }
 *       }
 *     }
 *   }
 * })
 */
export function createPluginActions (context, name, source, wrapper) {
  const methods = []

  // Create isolated action context with non-enumerable properties
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

  /**
   * Active actions for the action plugin
   * @type {import('#types').ActiveAction[]}
   */
  const actions = []

  // Process each action definition
  for (const [key, action] of Object.entries(source)) {
    // Validate unique action name
    if (context[key]) {
      throw new Error(`Plugin [${key}]: Expected unique action name`)
    }

    const actionModuleName = name + capitalize(key)
    const actionName = name + '_' + key

    // Bind method to plugin context
    let method = action.method.bind(context)

    // Apply optional wrapper if provided
    if (wrapper) {
      method = wrapper(method)
    }

    // Bind context to method for internal access
    context[key] = method

    // Create mock action call for export
    methods.push({
      name: actionModuleName,
      value: (params) => {
        return method(params, actionContext)
      }
    })

    /** @type {import('#types').DsPluginActionMetadata[]} */
    const metadata = []

    // Process metadata (can be array or single object)
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

    /** @type {import('#types').ActiveAction} */
    const actionItem = {
      name: actionName,
      method,
      metadata
    }

    // Add parameters if defined
    if (action.parameters) {
      actionItem.parameters = action.parameters
    }

    actions.push(actionItem)
  }

  return {
    methods,
    actions
  }
}

/**
 * Creates and registers public methods for a plugin.
 *
 * This function processes method definitions, binds them to the plugin context,
 * and returns them with standardized naming for export.
 *
 * @param {Object} context - The plugin execution context
 * @param {string} name - The plugin name (used as prefix for method names)
 * @param {DsPluginMethods} methods - Public method definitions object
 * @param {Function} [wrapper] - Optional wrapper function to wrap methods
 * @returns {Array<{ name: string, value: Function }>} - Array of method objects with name and value
 *
 * @example
 * // Basic public methods
 * const context = { name: 'user' }
 * const methods = createPluginMethods(context, 'user', {
 *   greet() {
 *     return `Hello, ${this.name}!`
 *   },
 *   getAge() {
 *     return this.age
 *   }
 * })
 * // Result: methods array with 'userGreet' and 'userGetAge' functions
 *
 * @example
 * // Method with parameters
 * const methods = createPluginMethods(context, 'math', {
 *   add(a, b) {
 *     return a + b
 *   }
 * })
 * // Result: methods array with 'mathAdd' function
 */
export function createPluginMethods (context, name, methods, wrapper) {
  const results = []

  // Process each public method definition
  for (const [key, value] of Object.entries(methods)) {
    // Validate unique method name
    if (context[key]) {
      throw new Error(`Plugin [${key}]: Expected unique method name`)
    }

    // Bind method to plugin context for 'this' access
    let method = value.bind(context)

    // Apply optional wrapper if provided
    if (wrapper) {
      method = wrapper(method)
    }

    // Add method to context for internal access
    context[key] = method

    // Add method to result with standardized naming
    results.push({
      name: name + capitalize(key),
      value: method
    })
  }

  return results
}


/**
 * Creates and registers private methods for a plugin.
 *
 * This function processes private method definitions, binds them to the plugin context,
 * and makes them available internally without exporting them. Private methods are
 * only accessible within the plugin's context and are not exposed to other plugins.
 *
 * @param {Object} context - The plugin execution context
 * @param {DsPluginMethods} methods - Private method definitions object
 * @param {Function} [wrapper] - Optional wrapper function to wrap private methods
 * @returns {Array} - Empty array (private methods are not exported)
 *
 * @example
 * // Private methods for internal use
 * const context = { name: 'auth' }
 * const results = createPluginPrivateMethods(context, {
 *   validateToken(token) {
 *     // Internal validation logic
 *     return token && token.length > 0
 *   },
 *   generateHash(input) {
 *     // Internal hash generation
 *     return input.split('').reverse().join('')
 *   }
 * })
 * // Result: methods are bound to context but not exported
 * // Can be called internally as this.validateToken(token)
 *
 * @example
 * // Private method with wrapper
 * const results = createPluginPrivateMethods(context, {
 *   logError(error) {
 *     console.error('Plugin error:', error)
 *   }
 * }, (method) => {
 *   return function(...args) {
 *     try {
 *       return method.apply(this, args)
 *     } catch (error) {
 *       this.logError(error)
 *       throw error
 *     }
 *   }
 * })
 */
export function createPluginPrivateMethods (context, methods, wrapper) {
  const results = []

  for (const [key, value] of Object.entries(methods)) {
    if (context[key]) {
      throw new Error(`Plugin [${key}]: Expected unique private method name`)
    }

    // Bind method to plugin context for 'this' access
    let method = value.bind(context)

    // Apply optional wrapper if provided
    if (wrapper) {
      method = wrapper(method)
    }

    // Add method to context (private methods are not exported)
    context[key] = method
  }

  return results
}
