import { capitalize, deepClone } from '@dooksa/utils'
import { bindContext } from './utils.js'
import {
  createPluginActions,
  createPluginMethods,
  createPluginPrivateMethods,
  createPluginState
} from './create-plugin-helpers.js'


/**
 * @import {DsPluginData, DsPluginMethods, DsPluginActions, DsPluginOptions, DsPluginActionMapper, DsPluginExport} from '#types'
 * @import {TestContext} from 'node:test'
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
 * @param {Name} name
 * @param {DsPluginOptions<
 * Name,
 * Data,
 * Methods,
 * PrivateMethods,
 * Actions,
 * Setup
 * > &
 * ThisType<
 * { name: Name } &
 * Data &
 * Methods &
 * PrivateMethods &
 * DsPluginActionMapper<Actions>
 * >} pluginOptions
 * @returns {DsPluginExport<Name, Methods, Actions, Setup, Data, PrivateMethods>}
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

  // The Implementation Registry: The "live" destination for all Bridge calls.
  context._impl = Object.create(null)

  context.name = name
  plugin.name = name

  if (metadata) plugin.metadata = deepClone(metadata)
  if (dependencies) plugin.dependencies = dependencies
  if (setup) plugin.setup = bindContext(setup, context)

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
    const res = createPluginActions(context, name, actions)
    // Attach stable bridges to plugin object
    for (const m of res.methods) plugin[m.name] = m.value
    plugin.actions = res.actions
  }

  if (methods) {
    const res = createPluginMethods(context, name, methods)
    for (const m of res) plugin[m.name] = m.value
  }

  if (privateMethods) {
    createPluginPrivateMethods(context, privateMethods)
  }

  // Define Property Descriptors
  const propertyDescriptorValues = {
    configurable: false,
    enumerable: false,
    writable: false
  }

  DEV: {
    /**
     * @internal
     * Internal helper to create the actual Observable object with `node:test` tracking.
     * Unlike the main factory, this does NOT create bridges; it creates direct mocks.
     */
    function createObservableInstanceInternal (name, config, testContext) {
      const { dependencies, state, metadata, data, actions, methods, privateMethods, setup } = config

      const context = Object.create(null)
      const plugin = Object.create(null)
      const mockMethods = Object.create(null)
      const wrapper = (fn) => testContext.mock.fn(fn)

      // Setup Observable Structure
      plugin.observe = mockMethods
      context.name = name
      plugin.name = name

      if (metadata) plugin.metadata = deepClone(metadata)
      if (dependencies) plugin.dependencies = dependencies
      if (data) {
        plugin.data = deepClone(data)
        Object.assign(context, plugin.data)
      }
      if (state) plugin.state = createPluginState(context, name, state)

      if (setup) {
        plugin.setup = wrapper(bindContext(setup, context))
        mockMethods.setup = plugin.setup.mock
      }

      // Create Mocks (using helpers but with mock wrapper)
      if (actions) {
        const res = createPluginActions(context, name, actions, wrapper)
        for (const method of res.methods) plugin[method.name] = method.value
        for (const action of res.actions) mockMethods[action.key] = action.method.mock
      }

      if (methods) {
        const res = createPluginMethods(context, name, methods, wrapper)
        for (const method of res) {
          plugin[method.name] = method.value
          mockMethods[method.key] = method.value.mock
        }
      }

      if (privateMethods) {
        createPluginPrivateMethods(context, privateMethods, (key, fn) => {
          const method = wrapper(fn)
          // Capture private method mocks for observation
          mockMethods[key] = method.mock

          return method
        })
      }

      return plugin
    }


    // Add createObservableInstance with Hijack Logic
    Object.defineProperties(plugin, {
      /**
       * Creates an observable (mocked) instance and "hijacks" the original plugin.
       *
       * Mechanism:
       * - Creates a fresh, isolated instance where all methods are wrapped in `mock.fn`.
       * - Updates the original plugin's `_impl` registry to point to this new instance.
       * - Any external module holding a reference to the original plugin will now
       * unwittingly execute the mocked logic.
       *
       * @param {TestContext} testContext - Node test context
       * @returns {Object} The observable instance (for assertions)
       */
      createObservableInstance: {
        value: (testContext) => {
          // Create the isolated Mocked Instance
          // We use an internal helper to bypass the bridge logic and get raw mock.fn objects.
          const obs = createObservableInstanceInternal(
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

          // THE HIJACK
          // Redirect the original context's _impl to the new observable methods.

          if (methods) {
            for (const key of Object.keys(methods)) {
              const fullName = name + capitalize(key)
              // Redirect original bridge -> Observable Mock
              context._impl[key] = (...args) => obs[fullName](...args)
            }
          }

          if (actions) {
            for (const key of Object.keys(actions)) {
              const fullName = name + capitalize(key)
              // Actions need params extracted, Bridge handles 'this', we just pass args
              context._impl[key] = (params) => obs[fullName](params)
            }
          }

          if (privateMethods) {
            for (const key of Object.keys(privateMethods)) {
              // Private methods are only on .observe
              context._impl[key] = (...args) => obs.observe[key](...args)
            }
          }

          return obs
        },
        ...propertyDescriptorValues
      },

      /**
       * Restores the plugin to its original state.
       *
       * - Resets `context._impl` to the original functions.
       * - Resets `context` data to original values.
       * MUST be called after tests to prevent leakage.
       */
      restore: {
        value () {
          // Reset data
          Object.assign(context, data ? deepClone(data) : {})

          // Reset bridges to original logic
          if (methods) {
            for (const [key, val] of Object.entries(methods)) context._impl[key] = val
          }
          if (actions) {
            for (const [key, val] of Object.entries(actions)) context._impl[key] = val.method
          }
          if (privateMethods) {
            for (const [key, val] of Object.entries(privateMethods)) context._impl[key] = val
          }
        },
        ...propertyDescriptorValues
      }

      // ... (include createInstance and other properties here as needed)
    })
  }

  // Lock down the production plugin
  Object.preventExtensions(context)
  Object.freeze(plugin)

  return plugin
}
