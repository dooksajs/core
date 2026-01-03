/**
 * @import {DsPlugin, DsPluginStateExport} from '../../create-plugin/types.js'
 * @import {AppPlugin, AppSetup} from '#types'
 */

/**
 * @callback UsePlugin
 * @description Adds a plugin to the application's plugin manager.
 * @param {DsPlugin} plugin - The plugin instance to register
 * @returns {void}
 */

/**
 * Creates a plugin management system for Dooksa applications.
 *
 * This function provides a centralized way to manage plugins, their dependencies,
 * actions, and state. It handles plugin registration, dependency resolution,
 * setup queue management, and action collection.
 *
 * @returns {AppPlugin} A plugin manager object with methods to register and manage plugins
 * @example
 * // Basic plugin registration
 * const pluginManager = appendPlugin()
 *
 * // Register a plugin with dependencies
 * pluginManager.use(authPlugin)
 *
 * // Access registered plugins
 * console.log(pluginManager.plugins.length) // 1
 *
 * // Get all actions
 * console.log(Object.keys(pluginManager.actions)) // ['login', 'logout', ...]
 *
 * // Execute setup for all queued plugins
 * pluginManager.setup.forEach(({ name, setup }) => {
 *   setup(pluginManager.state)
 * })
 *
 * @example
 * // Advanced usage with custom plugins
 * const manager = appendPlugin()
 *
 * // Register multiple plugins
 * manager.use(statePlugin)
 * manager.use(actionPlugin)
 * manager.use(customPlugin)
 *
 * // The manager automatically handles dependencies
 * // and collects all actions and state
 */
export default function appendPlugin () {
  /** @type {DsPlugin[]} */
  const appPlugins = []
  /** @type {AppSetup[]} */
  let appSetup = []
  /** @type {Object.<string, Function>} */
  const appActions = {}
  /** @type {DsPluginStateExport} */
  const appState = {
    _defaults: [],
    _items: [],
    _names: [],
    _values: {},
    defaults: [],
    schema: {}
  }

  return {
    /**
     * Registers a plugin with the application, handling dependencies and setup.
     *
     * This method performs several key functions:
     * - Prevents duplicate plugin registration
     * - Resolves and registers plugin dependencies recursively
     * - Collects plugin actions into a unified map
     * - Merges plugin state into the application state
     * - Queues plugins for setup execution
     *
     * @param {DsPlugin} plugin - The plugin instance to register
     * @returns {void}
     * @throws {Error} If plugin setup fails during dependency resolution
     * @example
     * // Register a simple plugin
     * manager.use(statePlugin)
     *
     * @example
     * // Register a plugin with dependencies
     * // Dependencies are automatically resolved
     * manager.use({
     *   name: 'auth',
     *   dependencies: [statePlugin, actionPlugin],
     *   actions: [
     *     { name: 'login', method: () => {} },
     *     { name: 'logout', method: () => {} }
     *   ],
     *   state: {
     *     _values: { user: null },
     *     _names: ['user']
     *   },
     *   setup: (config) => {
     *     // Initialize auth plugin
     *   }
     * })
     */
    use (plugin) {
    // check if plugin exists
      if (appPlugins.includes(plugin)) {
        const setup = plugin.setup

        // remove setup
        if (setup) {
          for (let i = 0; i < appSetup.length; i++) {
            const item = appSetup[i]

            if (item.setup === setup) {
              appSetup.splice(i, 1)
              i--
            }
          }
        }

        return
      }

      // store plugin
      appPlugins.push(plugin)
      const dependencies = plugin.dependencies
      const name = plugin.name
      const actions = plugin.actions

      if (plugin.setup) {
        appSetup.push({
          name,
          setup: plugin.setup
        })
      }

      if (dependencies) {
        for (let i = 0; i < dependencies.length; i++) {
          this.use(dependencies[i])
        }
      }

      // append actions
      if (appActions && actions) {
        for (let i = 0; i < actions.length; i++) {
          const action = actions[i]

          appActions[action.name] = action.method
        }
      }

      // extract data (need to parse and set default value)
      if (plugin.state) {
        const state = plugin.state

        appState._values = Object.assign(appState._values, state._values)
        appState._names = appState._names.concat(state._names)
        appState._items = appState._items.concat(state._items)

        // append defaults
        if (state._defaults.length) {
          appState._defaults = appState._defaults.concat(state._defaults)
        }
      }
    },
    /**
     * Gets the array of registered plugin instances.
     * @returns {DsPlugin[]} Array of plugin instances
     */
    get plugins () {
      return appPlugins
    },

    /**
     * Gets the consolidated application state from all plugins.
     * @returns {DsPluginStateExport} Application state with defaults, items, names, values, and schema
     */
    get state () {
      return appState
    },

    /**
     * Gets the map of all registered action names to their methods.
     * @returns {Object.<string, Function>} Map of action names to methods
     */
    get actions () {
      return appActions
    },

    /**
     * Gets the queue of plugins pending setup execution.
     * @returns {AppSetup[]} Array of setup items with name and setup function
     */
    get setup () {
      return appSetup
    },

    /**
     * Sets the setup queue (used to clear or replace pending setups).
     * @param {AppSetup[]} value - New setup queue array
     * @example
     * // Clear all pending setups
     * manager.setup = []
     *
     * // Replace with custom setups
     * manager.setup = [
     *   { name: 'custom', setup: (state) => { /* custom setup *\/ } }
     * ]
     */
    set setup (value) {
      appSetup = value
    }
  }
}
