import { dirname, normalize } from 'node:path'
import { mockStateData } from './mock-state-data.js'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  mockPluginExports,
  collectPluginState,
  mockPluginActions
} from '../utils/index.js'

/**
 * @import {TestContext} from 'node:test'
 */

/**
 * @typedef {Object} MockClientPluginMap
 * @description Maps plugin names to their type definitions
 * @property {any} metadata - Plugin metadata type
 * @property {any} state - State management plugin
 * @property {any} editor - Editor plugin
 * @property {any} action - Action plugin
 * @property {any} component - Component plugin
 * @property {any} fetch - HTTP fetch plugin
 * @property {any} list - List management plugin
 * @property {any} event - Event handling plugin
 * @property {any} page - Page management plugin
 * @property {any} operator - Operator plugin
 * @property {any} token - Token management plugin
 * @property {any} query - Query plugin
 * @property {any} route - Route management plugin
 * @property {any} icon - Icon plugin
 * @property {any} string - String utility plugin
 * @property {any} form - Form management plugin
 * @property {any} variable - Variable plugin
 * @property {any} regex - Regular expression plugin
 */

/**
 * @typedef {Object} MockStateMethods
 * @description Mock implementations of state management methods
 * @property {Function} stateAddListener - Mock for adding state change listeners
 * @property {Function} stateDeleteListener - Mock for removing state change listeners
 * @property {Function} stateDeleteValue - Mock for deleting state values
 * @property {Function} stateFind - Mock for finding state values
 * @property {Function} stateGenerateId - Mock for generating unique state IDs
 * @property {Function} stateGetSchema - Mock for retrieving state schemas
 * @property {Function} stateGetValue - Mock for retrieving state values
 * @property {Function} stateSetValue - Mock for setting state values
 * @property {Function} stateUnsafeSetValue - Mock for setting state values without validation
 */

/**
 * @typedef {Object} MockPlugin
 * @property {any} plugin - The main mocked plugin instance
 * @property {Object.<string, any>} modules - Additional mocked plugin modules
 * @property {Function} restore - Function to restore all mocks and clean up test state
 */

/**
 * Creates a complete mock environment for a dooksa plugin using utility functions
 * to reduce code repetition and improve maintainability
 *
 * @template {string} Name - The name of the plugin to mock
 * @template {string} PluginName - Additional plugin names to include
 * @param {TestContext} context - Node.js TestContext for creating mocks
 * @param {Object} param - Configuration object
 * @param {Name} param.name - Name of the primary plugin to mock
 * @param {'client' | 'server'} [param.platform='client'] - Target platform
 * @param {PluginName[]} [param.modules=[]] - Additional plugin names to mock
 * @param {Array} [param.namedExports=[]] - Array of mock definitions: { module, name, value }
 * @returns {Promise<MockPlugin & MockStateMethods>} Complete mock plugin environment
 *
 * @example
 * // Basic plugin mock
 * const mock = await mockClientPlugin(t, {
 *   name: 'event',
 * })
 *
 * // Advanced mock with custom exports and modules
 * const actionDispatch = t.mock.fn((x) => x)
 * const mock = await mockClientPlugin(t, {
 *   name: 'event',
 *   namedExports: [{ module: '#client', name: 'actionDispatch', value: actionDispatch }],
 *   modules: ['action', 'component']
 * })
 */
export async function mockClientPlugin (
  context,
  {
    name,
    modules = [],
    namedExports = []
  }
) {
  // Group mock definitions by module
  const clientNamedExports = {}
  const mocksByModule = {
    '#client': clientNamedExports
  }

  for (let i = 0; i < namedExports.length; i++) {
    const { module, name, value } = namedExports[i]

    if (!mocksByModule[module]) {
      mocksByModule[module] = {}
    }

    mocksByModule[module][name] = value
  }

  const restoreCallbacks = []
  const result = {
    module: {},
    method: {},
    restore: () => {
      // Execute all restore callbacks in reverse order
      for (let i = restoreCallbacks.length - 1; i >= 0; i--) {
        try {
          restoreCallbacks[i]()
        } catch (error) {
          console.warn('Error during mock restoration:', error)
        }
      }
    }
  }

  try {
    const tempPluginModule = await import('#client')
    /** @type {Object.<string, import('node:test').Mock<Function>>} */
    const actionMethods = {}
    const state = tempPluginModule.state
    const pluginState = []
    /** @type {any} */
    const mainPlugin = tempPluginModule[/** @type {string} */ (name)]
    // Setup state data
    if (mainPlugin && mainPlugin.state) {
      pluginState.push(mainPlugin)
    }

    /** @type {any} */
    result.module[/** @type {string} */ (name)] = mainPlugin

    for (let i = 0; i < modules.length; i++) {
      const moduleName = modules[i]
      /** @type {any} */
      const plugin = tempPluginModule[/** @type {string} */ (moduleName)]

      result.module[/** @type {string} */ (moduleName)] = plugin

      // Setup state data
      pluginState.push(...collectPluginState(plugin))

      // Setup mock module methods
      mockPluginActions(context, plugin, clientNamedExports, result, actionMethods)
      mockPluginExports(context, plugin, clientNamedExports, result)
    }

    // Setup mock state
    const stateData = mockStateData(pluginState)
    result.module.state = state

    // Add state methods to #client mocks
    mockPluginActions(context, state, clientNamedExports, result, actionMethods)
    mockPluginExports(context, state, clientNamedExports, result)

    state.setup(stateData)

    // Create mock contexts for each module BEFORE importing the plugin
    for (const [modulePath, moduleMocks] of Object.entries(mocksByModule)) {
      const mockContext = context.mock.module(modulePath, {
        namedExports: moduleMocks
      })
      restoreCallbacks.push(() => {
        mockContext.restore()
      })
    }

    // Import the plugin AFTER mock contexts are created
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const pluginPath = normalize(`${__dirname}/../../../plugins/src/client/${name}.js`)
    const pluginURLPath = pathToFileURL(pluginPath).href
    const pluginModule = await import(pluginURLPath + `?seed=${crypto.randomUUID()}`)
    /** @type {any} */
    const plugin = pluginModule[/** @type {string} */ (name)]
    result.module[/** @type {string} */ (name)] = plugin

    // Use utility functions for the imported plugin as well
    mockPluginActions(context, plugin, clientNamedExports, result, actionMethods)
    mockPluginExports(context, plugin, clientNamedExports, result)

    // Setup action function for action plugin if included
    if (result.module.action) {
      // Call the action plugin's setup method to inject the action function
      if (result.module.action.setup) {
        result.module.action.setup({ actions: actionMethods })
      }
    }

    return result
  } catch (error) {
    // Clean up any partial mocks on error
    try {
      result.restore()
    } catch (cleanupError) {
      console.warn('Error during cleanup after failure:', cleanupError)
    }

    throw new Error(`Failed to mock plugin "${name}": ${error.message}`)
  }
}
