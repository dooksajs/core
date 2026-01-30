import { capitalize, deepClone } from '@dooksa/utils'
import { bindContext } from './utils.js'
import {
  createPluginActions,
  createPluginMethods,
  createPluginPrivateMethods,
  createPluginState
} from './create-plugin-helpers.js'

/**
 * @import {DsPluginData, DsPluginMethods, DsPluginActions, DsPluginOptions, DsPluginActionMapper, DsPluginExport, DsPluginGetters, DsPluginState, DsPluginMetadata, DsPluginObservable} from '#types'
 * @import {TestContext, Mock} from 'node:test'
 * @import {WrapperCallback, PrivateMethodWrapperCallback} from './create-plugin-helpers.js'
 */

/**
 * Creates a Dooksa plugin with "Bridge" architecture for testability.
 *
 * This function creates an immutable plugin object where all methods are "Bridges".
 * These bridges point to an internal `_impl` registry. This allows the plugin's
 * behavior to be swapped at runtime (e.g., for mocking) without breaking
 * circular dependencies or ESM exports.
 *
 * @template {string} Name
 * @template {DsPluginData} Data
 * @template {DsPluginMethods} Methods
 * @template {DsPluginMethods} PrivateMethods
 * @template {DsPluginActions} Actions
 * @template {Function} Setup
 * @param {Name} name - Plugin name
 * @param {DsPluginOptions<Name, Data, Methods, PrivateMethods, Actions, Setup> &
 * ThisType<
 * { name: Name } &
 * Data &
 * Methods &
 * PrivateMethods &
 * DsPluginActionMapper<Actions>
 * >} pluginOptions - Plugin configuration options
 * @returns {DsPluginExport<Name, Methods, Actions, Setup, Data, PrivateMethods>} The created plugin
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
  // Setup the Permanent Production Context
  const context = Object.create(null)
  const plugin = Object.create(null)
  const _originalImplementation = Object.create(null)

  // Define Property Descriptors
  const propertyDescriptorValues = {
    configurable: false,
    enumerable: false,
    writable: false
  }

  // The implementation registry - the "live" destination for all Bridge calls.
  context._impl = Object.create(null)
  context.name = name
  plugin.name = name

  if (metadata) {
    plugin.metadata = deepClone(metadata)
  }

  if (dependencies) {
    plugin.dependencies = dependencies
  }

  if (setup) {
    plugin.setup = bindContext(setup, context)
  }

  // Initialise Data
  if (data) {
    plugin.data = deepClone(data)
    // Populate context with data properties
    for (const [key, value] of Object.entries(plugin.data)) {
      context[key] = value
    }
  }

  // Initialise State
  if (state) {
    plugin.state = createPluginState(context, name, state)
  }

  // Initialise the "Bridges"
  // The helpers populate context._impl and return stable Bridge functions.

  if (actions) {
    const result = createPluginActions(context, name, actions)
    // Attach stable bridges to plugin object
    for (const method of result.methods) {
      plugin[method.name] = method.value
    }

    plugin.actions = result.actions
  }

  if (methods) {
    const result = createPluginMethods(context, name, methods)
    for (const method of result) {
      plugin[method.name] = method.value
    }
  }

  if (privateMethods) {
    createPluginPrivateMethods(context, privateMethods)
  }

  DEV: {
    /**
     * @internal
     * Internal helper to create the actual Observable object with `node:test` tracking.
     * Unlike the main factory, this does NOT create bridges; it creates direct mocks.
     *
     * @param {string} name - Plugin name
     * @param {Object} config - Plugin configuration
     * @param {DsPluginGetters[]} [config.dependencies] - Plugin dependencies
     * @param {DsPluginState} [config.state] - State configuration
     * @param {DsPluginMetadata} [config.metadata] - Plugin metadata
     * @param {DsPluginData} [config.data] - Plugin data
     * @param {DsPluginActions} [config.actions] - Plugin actions
     * @param {DsPluginMethods} [config.methods] - Plugin methods
     * @param {DsPluginMethods} [config.privateMethods] - Plugin private methods
     * @param {Function} [config.setup] - Setup function
     * @param {TestContext} testContext - Node test context
     * @returns {DsPluginObservable<Name, Methods, Actions, PrivateMethods, Setup>} The observable plugin instance
     */
    function createObservableInstanceInternal (name, {
      dependencies,
      state,
      metadata,
      data,
      actions,
      methods,
      privateMethods,
      setup
    }, testContext) {

      const context = Object.create(null)
      const plugin = Object.create(null)
      const mockMethods = Object.create(null)
      /** @type {WrapperCallback} */
      const wrapper = (fn) => testContext.mock.fn(fn)

      // Setup observable structure
      plugin.observe = mockMethods
      // The implementation registry
      context._impl = Object.create(null)

      // Set plugin name
      context.name = name
      plugin.name = name

      if (metadata) {
        plugin.metadata = deepClone(metadata)
      }

      if (dependencies) {
        plugin.dependencies = dependencies
      }

      if (data) {
        plugin.data = deepClone(data)
        Object.assign(context, plugin.data)
      }

      if (state) {
        plugin.state = createPluginState(context, name, state, false)
      }

      if (setup) {
        plugin.setup = wrapper(bindContext(setup, context))
        mockMethods.setup = plugin.setup.mock
      }

      // Create Mocks (using helpers but with mock wrapper)
      if (actions) {
        const result = createPluginActions(context, name, actions, wrapper)
        plugin.actions = result.actions

        for (const action of result.actions) {
          const actionModuleName = name + capitalize(action.key)
          // insert action method as plugin method to escape the context wrapper
          plugin[actionModuleName] = action.method
          mockMethods[action.key] = action.method.mock
        }
      }

      if (methods) {
        const result = createPluginMethods(context, name, methods, wrapper)

        for (const method of result) {
          plugin[method.name] = method.value
          mockMethods[method.key] = method.value.mock
        }
      }

      if (privateMethods) {
        createPluginPrivateMethods(context, privateMethods, (key, fn) => {
          const method = wrapper(fn)

          // Capture private method mocks for observation
          plugin[key] = method
          mockMethods[key] = method.mock

          return method
        })
      }

      return plugin
    }

    // Add createObservableInstance
    Object.defineProperties(plugin, {
      createObservableInstance: {
        /**
         * Creates an observable (mocked) instance and "hijacks" the original plugin.
         *
         * MECHANISM:
         * - Creates a fresh, isolated instance where all methods are wrapped in `mock.fn`.
         * - Updates the original plugin's `_impl` registry to point to this new instance.
         * - Any external module holding a reference to the original plugin will now
         * unwittingly execute the mocked logic.
         *
         * @param {TestContext} testContext - Node test context
         * @returns {Object} The observable instance (for assertions)
         */
        value (testContext) {
          // Create the isolated Mocked Instance
          // We use an internal helper to bypass the bridge logic and get raw mock.fn objects.
          const observable = createObservableInstanceInternal(
            name,
            {
              dependencies,
              state,
              metadata,
              data,
              actions,
              methods,
              privateMethods,
              setup
            },
            testContext
          )

          // Redirect the original context's _impl to the new observable methods.
          if (methods) {
            for (const key of Object.keys(methods)) {
              const fullName = name + capitalize(key)
              // store original implementation
              _originalImplementation[key] = context._impl[key]
              // Redirect original bridge -> Observable Mock
              context._impl[key] = (...args) => observable[fullName](...args)
            }
          }

          if (actions) {
            for (const key of Object.keys(actions)) {
              const fullName = name + capitalize(key)
              // store original implementation
              _originalImplementation[key] = context._impl[key]
              // Actions need params extracted, Bridge handles 'this', we just pass args
              context._impl[key] = (params) => observable[fullName](params)
            }
          }

          if (privateMethods) {
            for (const key of Object.keys(privateMethods)) {
              // store original implementation
              _originalImplementation[key] = context._impl[key]
              // Redirect original bridge -> Observable Mock
              context._impl[key] = (...args) => observable[key](...args)
            }
          }

          return observable
        },
        ...propertyDescriptorValues
      },
      restore: {
        /**
         * Restores the plugin to its original state.
         *
         * - Resets `context._impl` to the original functions.
         * - Resets `context` data to original values.
         */
        value () {
          // Reset data
          if (data) {
            const newData = deepClone(data)
            // Populate context with data properties
            for (const [key, value] of Object.entries(newData)) {
              context[key] = value
            }
          }

          // Reset original implementation
          if (methods) {
            for (const key of Object.keys(methods)) {
              if (_originalImplementation[key]) {
                context._impl[key] = _originalImplementation[key]
              }
            }
          }
          if (actions) {
            for (const key of Object.keys(actions)) {
              if (_originalImplementation[key]) {
                context._impl[key] = _originalImplementation[key]
              }
            }
          }
          if (privateMethods) {
            for (const key of Object.keys(privateMethods)) {
              if (_originalImplementation[key]) {
                context._impl[key] = _originalImplementation[key]
              }
            }
          }
        },
        ...propertyDescriptorValues
      }
    })
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

  // Lock down the production plugin
  Object.preventExtensions(context)
  Object.freeze(plugin)

  return plugin
}
