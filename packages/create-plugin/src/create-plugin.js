import { deepClone } from '@dooksa/utils'
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
  plugin.createInstance = (options = {}) => {
    // Merge override data with original data
    const mergedData = options?.data
      ? {
        ...data,
        ...options.data
      }
      : data

    // Use custom name or original name
    const instanceName = options?.name || name

    // Create new instance with merged configuration
    return createPlugin(instanceName, {
      dependencies,
      state,
      metadata,
      data: mergedData,
      actions,
      methods,
      privateMethods,
      setup
    })
  }

  const propertyDescriptorValues = {
    configurable: false,
    enumerable: false,
    writable: false
  }
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

  // Freeze context and plugin to prevent runtime modifications
  Object.preventExtensions(context)
  Object.freeze(plugin)

  return plugin
}
