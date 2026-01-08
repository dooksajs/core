import { dirname, normalize } from 'node:path'
import { mockStateData } from './mock-state-data.js'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  mockPluginExports,
  mockPluginActions
} from '../utils/index.js'

/**
 * @import {
 *   stateAddListener,
 *   stateDeleteListener,
 *   stateDeleteValue,
 *   stateFind,
 *   stateGenerateId,
 *   stateGetSchema,
 *   stateGetValue,
 *   stateSetValue,
 *   stateUnsafeSetValue
 * } from '#client'
 * @import {Mock, TestContext} from 'node:test'
 */


/**
 * @typedef {Object} MockStateMethods
 * @description Mock implementations of state management methods used in testing.
 * These methods are wrapped with Node.js test mocking capabilities to track calls,
 * arguments, and return values during test execution. They provide the same interface
 * as the real state methods but allow for controlled testing behavior.
 * @property {Mock<stateAddListener>} stateAddListener - Mock for adding state change listeners
 * @property {Mock<stateDeleteListener>} stateDeleteListener - Mock for removing state change listeners
 * @property {Mock<stateDeleteValue>} stateDeleteValue - Mock for deleting state values
 * @property {Mock<stateFind>} stateFind - Mock for finding state values by criteria
 * @property {Mock<stateGenerateId>} stateGenerateId - Mock for generating unique state IDs
 * @property {Mock<stateGetSchema>} stateGetSchema - Mock for retrieving state schemas
 * @property {Mock<stateGetValue>} stateGetValue - Mock for retrieving state values
 * @property {Mock<stateSetValue>} stateSetValue - Mock for setting state values
 * @property {Mock<stateUnsafeSetValue>} stateUnsafeSetValue - Mock for setting state values without validation
 */

/**

 * @typedef {Object} MockPlugin
 * @property {Object.<string, Mock<Function>>} methods - Map of exposed method names to their mock functions
 * @property {Object.<string, Mock<Function>>} actions - Map of exposed action names to their mock functions
 * @property {Object.<string, Object>} schema - Map of plugin names to their schemas
 * @property {Object.<string, Function>} setup - Map of plugin names to their setup functions
 * @property {Object.<string, Function> & MockStateMethods} method - Map of exposed both action and method a names to their mock functions
 * @property {Function} restore - Function to restore all mocks and clean up test state
 */

/**
 * @typedef {Object} MockPluginNamedExports
 * @property {module} module - name of the module
 * @property {string} name - name of the named export
 * @property {*} value - the value of the named export
 */

/**
 * Creates a complete mock environment for a dooksa plugin using utility functions
 * to reduce code repetition and improve maintainability
 * @param {TestContext} context - Node.js TestContext for creating mocks
 * @param {Object} param - Configuration object
 * @param {string} param.name - Name of the primary plugin to mock
 * @param {string[]} [param.modules=[]] - Additional plugin names to mock
 * @param {MockPluginNamedExports[]} [param.namedExports=[]] - Array of mock definitions: { module, name, value }
 * @returns {Promise<MockPlugin>} Complete mock plugin environment
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
    methods: {},
    actions: {},
    setup: {},
    schema: {},
    get method () {
      return {
        ...this.methods,
        ...this.actions
      }
    },
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
    let actionModule
    const state = tempPluginModule.state
    const pluginState = []
    const mainPlugin = tempPluginModule[name]
    // Setup state data
    if (mainPlugin && mainPlugin.state) {
      pluginState.push(mainPlugin)
    }

    if (name === 'action') {
      actionModule = mainPlugin
    }

    for (let i = 0; i < modules.length; i++) {
      const moduleName = modules[i]
      const plugin = tempPluginModule[moduleName]

      if (moduleName === 'action') {
        actionModule = plugin
      }

      // Setup state data
      if (plugin && plugin.state) {
        pluginState.push(plugin)
      }

      // Setup mock module methods
      mockPluginActions(context, plugin, clientNamedExports, result, actionMethods)
      mockPluginExports(context, plugin, clientNamedExports, result, moduleName)
    }

    // Setup mock state
    const stateData = mockStateData(pluginState)

    // Add state methods to #client mocks
    mockPluginActions(context, state, clientNamedExports, result, actionMethods)
    mockPluginExports(context, state, clientNamedExports, result, 'state')

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
    const plugin = pluginModule[name]

    // Use utility functions for the imported plugin as well
    mockPluginActions(context, plugin, clientNamedExports, result, actionMethods)
    mockPluginExports(context, plugin, clientNamedExports, result, name)

    // Add custom named exports to result.methods if they exist
    for (const [exportName, mockFn] of Object.entries(clientNamedExports)) {
      if (!result.methods[exportName] && !result.actions[exportName]) {
        result.methods[exportName] = mockFn
      }
    }

    // Populate schema and setup for the main plugin
    if (plugin && plugin.schema) {
      result.schema[name] = plugin.schema
    }
    if (plugin && plugin.setup && name !== 'state' && name !== 'action') {
      result.setup[name] = plugin.setup
    }

    // Populate schema and setup for additional modules
    for (let i = 0; i < modules.length; i++) {
      const moduleName = modules[i]
      const modulePlugin = tempPluginModule[moduleName]

      if (modulePlugin && modulePlugin.schema) {
        result.schema[moduleName] = modulePlugin.schema
      }
      if (modulePlugin && modulePlugin.setup && moduleName !== 'state' && moduleName !== 'action') {
        result.setup[moduleName] = modulePlugin.setup
      }
    }

    // Setup action function for action plugin if included
    if (actionModule && typeof actionModule.setup === 'function') {
      actionModule.setup({ actions: actionMethods })
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
