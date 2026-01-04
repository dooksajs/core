import { resolve } from 'node:path'
import { mockPluginModuleContext } from './mock-plugin-module-context.js'
import { mockPluginModule } from './mock-plugin-module.js'
import { mockState } from './mock-state.js'
import { pathToFileURL } from 'node:url'

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
 * @template {string} PluginName
 * @typedef {{ [K in PluginName]: K extends keyof MockClientPluginMap ? MockClientPluginMap[K] : any }} MockClientPluginMapper
 */

/**
 * @template {string} Name
 * @template {string} PluginName
 * @typedef {Object} MockPlugin
 * @property {Name extends keyof MockClientPluginMap ? MockClientPluginMap[Name] : any} plugin - The main mocked plugin instance
 * @property {MockClientPluginMapper<PluginName>} modules - Additional mocked plugin modules
 * @property {Function} restore - Function to restore all mocks and clean up test state
 */

/**
 * Validates plugin parameters for the mockPlugin function
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
 * Creates a complete mock environment for a dooksa plugin
 *
 * @template {string} Name - The name of the plugin to mock
 * @template {string} PluginName - Additional plugin names to include
 * @param {TestContext} context - Node.js TestContext for creating mocks
 * @param {Object} param - Configuration object
 * @param {Name} param.name - Name of the primary plugin to mock
 * @param {'client' | 'server'} [param.platform='client'] - Target platform
 * @param {PluginName[]} [param.modules=[]] - Additional plugin names to mock
 * @param {Object.<string, Function>} [param.namedExports={}] - Pre-defined mock functions
 * @returns {Promise<MockPlugin<Name, PluginName> & MockStateMethods>} Complete mock plugin environment
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
    // Import the main plugin from the packages directory
    const pluginPath = resolve(`../../packages/plugins/src/${platform}/${name}.js`)
    const pluginURLPath = pathToFileURL(pluginPath)
    const mainPlugin = await import(pluginURLPath.href + `?seed=${crypto.randomUUID()}`)

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
        const mockMethod = context.mock.method(state, methodName)
        namedExports[methodName] = mockMethod
        result[methodName] = mockMethod
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
