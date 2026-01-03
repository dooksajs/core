import { mockPluginModule, mockPluginModuleContext } from '#mock'
import { mockState } from './mock-state.js'

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
 * @template {string} Name
 * @template {string} PluginName
 * @typedef {Object} MockPlugin
 * @description The main return type for the mockPlugin function. Contains the mocked
 * plugin instance, any additional mocked modules, and a restore function to clean up
 * mocks after testing. This type combines the primary plugin mock with optional
 * module mocks and state method mocks.
 * @property {Name extends keyof MockClientPluginMap ? MockClientPluginMap[Name] : any} plugin - The main mocked plugin instance
 * @property {MockClientPluginMapper<PluginName>} modules - Additional mocked plugin modules
 * @property {Function} restore - Function to restore all mocks and clean up test state
 */

/**
 * Validates plugin parameters for the mockPlugin function.
 * Ensures all required parameters are properly formatted and valid before
 * proceeding with plugin mocking operations.
 *
 * @param {Object} param - Parameter object containing plugin configuration
 * @param {string} param.name - Name of plugin to mock (must be non-empty string)
 * @param {'client' | 'server'} [param.platform='client'] - Platform the plugin runs on
 * @param {string[]} [param.modules=[]] - Array of additional plugin module names to mock
 * @param {Object.<string, Function>} [param.namedExports={}] - Named export functions to mock
 * @throws {Error} If required parameters are invalid or malformed
 */
function validateParams ({ name, platform, modules, namedExports }) {
  if (!name || typeof name !== 'string') {
    throw new Error('Invalid plugin name: expected non-empty string')
  }

  if (platform !== 'client' && platform !== 'server') {
    throw new Error('Invalid platform: expected "client" or "server"')
  }

  if (!Array.isArray(modules)) {
    throw new Error('Invalid modules: expected array')
  }

  if (typeof namedExports !== 'object' || namedExports === null) {
    throw new Error('Invalid namedExports: expected object')
  }
}

/**
 * Creates a mock dooksa plugin for testing purposes.
 *
 * This function orchestrates the creation of a complete mock environment for a dooksa plugin,
 * including the main plugin, additional modules, and state management methods. It uses Node.js
 * test mocking capabilities to provide full control over plugin behavior during testing.
 *
 * @template {string} Name - The name of the plugin to mock
 * @template {string} PluginName - Additional plugin names to include in the mock
 * @param {TestContext} context - Node.js TestContext for creating mocks and managing test lifecycle
 * @param {Object} param - Configuration object for plugin mocking
 * @param {Name} param.name - Name of the primary plugin to mock
 * @param {'client' | 'server'} [param.platform='client'] - Target platform for the plugin
 * @param {PluginName[]} [param.modules=[]] - Additional plugin names to mock alongside the main plugin
 * @param {Object.<string, Function>} [param.namedExports={}] - Pre-defined mock functions for specific exports
 * @returns {Promise<MockPlugin<Name, PluginName> & MockStateMethods>} A complete mock plugin environment with state methods
 *
 * @example
 * // Basic plugin mock
 * const mock = await mockPlugin(t, {
 *   name: 'event',
 * })
 *
 * // Advanced mock with custom exports and modules
 * const actionDispatch = t.mock.fn((x) => x)
 * const mock = await mockPlugin(t, {
 *   name: 'event',
 *   namedExports: { actionDispatch },
 *   modules: ['action', 'component']
 * })
 *
 * // Use mocked state methods
 * mock.stateSetValue({
 *   name: 'event/listeners',
 *   value: ['actionId'],
 *   options: {
 *     id: 'eventId',
 *     prefixId: 'componentId'
 *   }
 * })
 *
 * // Test plugin behavior
 * mock.plugin.emit({
 *   name: 'eventId',
 *   id: 'componentId',
 * })
 */
export async function mockPlugin (
  context,
  {
    name,
    platform = 'client',
    modules = [],
    namedExports = {}
  }
) {
  // Validate parameters
  validateParams({
    name,
    platform,
    modules,
    namedExports
  })

  const restoreCallbacks = []
  const result = {
    modules: ({}),
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
    // Import the main plugin
    const pluginPath = `../src/${platform}/${name}.js?seed=${crypto.randomUUID()}`
    const mainPlugin = await import(pluginPath)

    // Import and mock additional modules
    const moduleMocks = await Promise.all(
      modules.map(async (moduleName) => {
        try {
          const mockResult = await mockPluginModule(context, (moduleName), platform)

          // Add to named exports
          for (const methodName of mockResult.methodNames) {
            namedExports[methodName] = mockResult.plugin[methodName]
          }

          return mockResult
        } catch (error) {
          throw new Error(`Failed to mock module "${moduleName}": ${error.message}`)
        }
      })
    )

    // Build modules result object
    for (const mockResult of moduleMocks) {
      result.modules[mockResult.name] = mockResult.plugin
    }

    // Prepare state schema from all plugins
    const plugins = []
    const allImports = [mainPlugin, ...moduleMocks.map(m => ({ default: m.plugin }))]

    for (const { default: plugin } of allImports) {
      if (plugin?.state) {
        plugins.push(plugin)
      }
    }

    // Mock state
    const state = await mockState(plugins)

    // Create state method mocks and add to result
    const stateMethods = [
      'stateAddListener',
      'stateDeleteListener',
      'stateDeleteValue',
      'stateFind',
      'stateGenerateId',
      'stateGetSchema',
      'stateGetValue',
      'stateSetValue',
      'stateUnsafeSetValue'
    ]

    for (const methodName of stateMethods) {
      if (typeof state[methodName] === 'function') {
        // @ts-ignore
        const mockMethod = context.mock.method(state, methodName)
        namedExports[methodName] = mockMethod
        result[methodName] = mockMethod

        // Track for restoration
        restoreCallbacks.push(() => {
          // Mock methods are automatically restored by node:test
        })
      }
    }

    // Mock plugin module context
    const mockContext = mockPluginModuleContext(context, namedExports, platform)
    restoreCallbacks.push(() => mockContext.restore())

    // Mock the main plugin
    const { plugin } = await mockPluginModule(context, (name), platform)
    result.plugin = plugin

    return (result)
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
