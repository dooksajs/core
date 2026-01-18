import { deepClone, isObject } from '@dooksa/utils'
import { bindContext } from './utils.js'
import { createPluginActions, createPluginMethods, createPluginPrivateMethods, createPluginState } from './create-plugin-helpers.js'

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

/**
 * Creates a Dooksa plugin with comprehensive context binding and lifecycle management.
 *
 * This function orchestrates the creation of a plugin by:
 * - Initializing a isolated context for plugin execution
 * - Setting up state management with schema validation
 * - Binding data to the context
 * - Creating action handlers with metadata
 * - Registering public and private methods
 * - Providing instance creation capabilities
 *
 * @template {string} Name - The unique plugin name identifier
 * @template {DsPluginData} Data - Plugin data structure type
 * @template {DsPluginMethods} Methods - Public methods interface type
 * @template {DsPluginMethods} PrivateMethods - Private methods interface type
 * @template {DsPluginActions} Actions - Action handlers type
 * @template {Function} Setup - Setup function type
 *
 * @param {Name} name - Unique identifier for the plugin (e.g., 'user', 'auth')
 * @param {DsPluginOptions<Name, Data, Methods, PrivateMethods, Actions, Setup> &
 *         ThisType<{ name: Name } & Data & Methods & PrivateMethods & DsPluginActionMapper<Actions>>} pluginOptions - Full plugin options type with context binding
 * @returns {DsPluginExport<Name, Methods, Actions, Setup>} - Frozen plugin object with setup, actions, methods, and instance creation
 *
 * @example
 * // Basic plugin with data and methods
 * const userPlugin = createPlugin('user', {
 *   data: {
 *     name: 'John',
 *     age: 30
 *   },
 *   methods: {
 *     greet() {
 *       return `Hello, ${this.name}!`
 *     }
 *   }
 * })
 *
 * @example
 * // Plugin with actions and state
 * const authPlugin = createPlugin('auth', {
 *   state: {
 *     defaults: {
 *       token: null
 *     },
 *     schema: {
 *       token: { type: 'string' }
 *     }
 *   },
 *   actions: {
 *     login: {
 *       method: function(params) {
 *         this.token = params.token
 *       },
 *       metadata: {
 *         title: 'User Login',
 *         description: 'Authenticate user and store token'
 *       }
 *     }
 *   }
 * })
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

  // Initialize isolated execution context for the plugin
  const context = Object.create(null)
  const plugin = Object.create(null)

  // Set plugin name in context for identification
  context.name = name
  plugin.name = name

  if (metadata) {
    plugin.metadata = deepClone(metadata)
  }

  if (dependencies) {
    plugin.dependencies = dependencies
  }

  // Bind setup function to plugin context for proper 'this' binding
  plugin.setup = bindContext(setup, context)

  // Create state management if state configuration is provided
  if (state) {
    plugin.state = createPluginState(context, name, state)
  }

  // Clone and bind data to context
  if (data) {
    plugin.data = deepClone(data)

    // Populate context with data properties for direct access
    for (const [key, value] of Object.entries(plugin.data)) {
      context[key] = value
    }
  }

  // Create and register action handlers
  if (actions) {
    const results = createPluginActions(context, name, actions)

    // Attach action metadata to plugin
    plugin.actions = results.actions

    // Register action method modules on plugin object
    for (let i = 0; i < results.methods.length; i++) {
      const method = results.methods[i]
      plugin[method.name] = method.value
    }
  }

  // Register public methods
  if (methods) {
    const results = createPluginMethods(context, name, methods)

    // Attach methods to plugin object
    for (let i = 0; i < results.length; i++) {
      const method = results[i]
      plugin[method.name] = method.value
    }
  }

  // Register private methods in context only
  if (privateMethods) {
    createPluginPrivateMethods(context, privateMethods)
  }

  // Plugin property descriptors
  const propertyDescriptorValues = {
    configurable: false,
    enumerable: false,
    writable: false
  }

  Object.defineProperty(plugin, 'createInstance', {
    /**
     * Creates a new plugin instance with optional configuration overrides.
     *
     * This method enables plugin reuse with different configurations while
     * maintaining the original plugin structure and behavior.
     *
     * @param {Object} [options={}] - Instance creation options
     * @param {string} [options.name] - Override plugin name for the instance
     * @param {Data} [options.data] - Override or extend original data
     * @returns {DsPluginExport<Name, Methods, Actions, Setup>} - New plugin instance
     *
     * @example
     * // Create instance with custom data
     * const adminInstance = userPlugin.createInstance({
     *   name: 'admin-user',
     *   data: { name: 'Admin', role: 'administrator' }
     * })
     *
     * @example
     * // Create instance with extended data
     * const extendedInstance = authPlugin.createInstance({
     *   data: { token: 'abc123', remember: true }
     * })
     */
    value: (options = {}) => {
      let instanceName = name
      let instanceData = data

      if (isObject(options)) {
        // Merge override data with original data
        if (isObject(options.data)) {
          instanceData = Object.assign(data, options.data)
        }

        // Use custom name or original name
        if (typeof options.name === 'string') {
          // @ts-ignore
          instanceName = options.name
        }
      }

      // Create new instance with merged configuration
      return createPlugin(instanceName, {
        dependencies,
        state,
        metadata,
        data: instanceData,
        actions,
        methods,
        privateMethods,
        setup
      })
    },
    ...propertyDescriptorValues
  })

  Object.defineProperties(plugin, {
    name: propertyDescriptorValues,
    dependencies: propertyDescriptorValues,
    state: propertyDescriptorValues,
    metadata: propertyDescriptorValues,
    data: propertyDescriptorValues,
    actions: propertyDescriptorValues,
    methods: propertyDescriptorValues,
    privateMethods: propertyDescriptorValues,
    setup: propertyDescriptorValues,
    createInstance: propertyDescriptorValues
  })

  DEV: {
    Object.defineProperties(plugin, {
      createObservableInstance: {
        /**
         * Create an observable plugin instance
         * @param {import('node:test').TestContext} testContext
         */
        value: (testContext) => {
          // Initialize isolated execution context for the plugin
          const context = Object.create(null)
          const plugin = Object.create(null)
          const mockMethods = Object.create(null)
          const mockFnWrapper = (fn) => testContext.mock.fn(fn)

          // Observe methods
          plugin.observe = mockMethods

          // Set plugin name in context for identification
          context.name = name
          plugin.name = name

          if (metadata) {
            plugin.metadata = deepClone(metadata)
          }

          if (dependencies) {
            plugin.dependencies = dependencies
          }

          // Bind setup function to plugin context for proper 'this' binding
          if (setup) {
            plugin.setup = testContext.mock.fn(bindContext(setup, context))
            mockMethods.setup = plugin.setup.mock
          }

          // Create state management if state configuration is provided
          if (state) {
            plugin.state = createPluginState(context, name, state)
          }

          // Clone and bind data to context
          if (data) {
            plugin.data = deepClone(data)

            // Populate context with data properties for direct access
            for (const [key, value] of Object.entries(plugin.data)) {
              context[key] = value
            }
          }

          // Create and register action handlers
          if (actions) {
            const results = createPluginActions(context, name, actions, mockFnWrapper)

            // Attach action metadata to plugin
            plugin.actions = results.actions

            // Register action method modules on plugin object
            for (let i = 0; i < results.methods.length; i++) {
              const method = results.methods[i]
              plugin[method.name] = method.value
            }

            for (let i = 0; i < results.actions.length; i++) {
              const action = results.actions[i]
              mockMethods[action.key] = action.method.mock
            }
          }

          // Register public methods
          if (methods) {
            const results = createPluginMethods(context, name, methods, mockFnWrapper)

            // Attach methods to plugin object
            for (let i = 0; i < results.length; i++) {
              const method = results[i]
              plugin[method.name] = method.value
              // @ts-ignore
              mockMethods[method.key] = method.value.mock
            }
          }

          // Register private methods in context only
          if (privateMethods) {
            for (const [key, value] of Object.entries(privateMethods)) {
              // Bind method to plugin context for 'this' access
              const method = testContext.mock.fn(value.bind(context))

              // Add method to context (private methods are not exported)
              context[key] = method
              mockMethods[key] = method.mock
            }
          }

          return plugin
        },
        ...propertyDescriptorValues
      },
      restore: {
        /**
         * Restore plugin
         */
        value () {
          Object.assign(context, data ? deepClone(data) : {})
        },
        ...propertyDescriptorValues
      }
    })
  }

  // Freeze context and plugin to prevent runtime modifications
  Object.preventExtensions(context)
  Object.freeze(plugin)

  return plugin
}
