import { dirname, normalize } from 'node:path'
import { mockStateData } from './mock-state-data.js'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  mockPluginExports,
  collectPluginState,
  mockPluginActions
} from '../utils/index.js'

/**
 * @import {
 *   metadata,
 *   state,
 *   stateAddListener,
 *   stateDeleteListener,
 *   stateDeleteValue,
 *   stateFind,
 *   stateGenerateId,
 *   stateGetSchema,
 *   stateGetValue,
 *   stateSetValue,
 *   stateUnsafeSetValue,
 *   editor,
 *   action,
 *   component,
 *   $fetch,
 *   list,
 *   event,
 *   page,
 *   operator,
 *   token,
 *   query,
 *   route,
 *   icon,
 *   string,
 *   form,
 *   variable,
 *   regex
 *  } from '#client'
 * @import {Mock, TestContext} from 'node:test'
 */

/**
 * @typedef {Object} MockClientPluginMap
 * @description Maps plugin names to their type definitions. This type serves as a registry
 * for all available client-side plugin types that can be mocked in the testing system.
 * Each property represents a distinct plugin category with its specific type definition.
 * @property {metadata} metadata - Plugin metadata type for configuration and identification
 * @property {state} state - State management plugin type for application state
 * @property {editor} editor - Editor plugin type for UI editing functionality
 * @property {action} action - Action plugin type for event-driven operations
 * @property {component} component - Component plugin type for UI components
 * @property {$fetch} fetch - HTTP fetch plugin type for API requests
 * @property {list} list - List management plugin type for collections
 * @property {event} event - Event handling plugin type for pub/sub patterns
 * @property {page} page - Page management plugin type for routing/views
 * @property {operator} operator - Operator plugin type for data transformations
 * @property {token} token - Token management plugin type for authentication
 * @property {query} query - Query plugin type for data fetching
 * @property {route} route - Route management plugin type for navigation
 * @property {icon} icon - Icon plugin type for UI icons
 * @property {string} string - String utility plugin type for text operations
 * @property {form} form - Form management plugin type for user input
 * @property {variable} variable - Variable plugin type for dynamic data
 * @property {regex} regex - Regular expression plugin type for pattern matching
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
 * @template {string} PluginName
 * @typedef {{ [K in PluginName]: K extends keyof MockClientPluginMap ? MockClientPluginMap[K] : any }} MockClientPluginMapper
 * @description Generic utility type that maps a subset of plugin names to their corresponding
 * type definitions. This allows creating typed objects that contain only specified plugins
 * while maintaining full type safety for those selected plugins.
 */

/**
 * @template {string} PluginName
 * @typedef {Object} MockPlugin
 * @property {MockClientPluginMapper<PluginName>} module - Additional mocked plugin modules
 * @property {Object.<string, Function> & MockStateMethods} method - Map of exposed method names to their mock functions
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
 * @returns {Promise<MockPlugin<PluginName | Name>>} Complete mock plugin environment
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
    const mainPlugin = tempPluginModule[name]
    // Setup state data
    if (mainPlugin && mainPlugin.state) {
      pluginState.push(mainPlugin)
    }

    result.module[name] = mainPlugin

    for (let i = 0; i < modules.length; i++) {
      const moduleName = modules[i]
      const plugin = tempPluginModule[moduleName]

      result.module[moduleName] = plugin

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
    const plugin = pluginModule[name]
    result.module[name] = plugin

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
