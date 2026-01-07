import { dirname, normalize } from 'node:path'
import { mockStateData } from './mock-state-data.js'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { mockActionMethod } from './mock-action-method.js'

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
export async function mockClientPlugin (
  context,
  {
    name,
    modules = [],
    namedExports = {}
  }
) {
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
    const tempPluginModule = await import('#client')

    const state = tempPluginModule.state
    const pluginState = []
    const mainPlugin = tempPluginModule[name]
    // Setup state data
    if (mainPlugin && mainPlugin.state) {
      pluginState.push(mainPlugin)
    }

    for (let i = 0; i < modules.length; i++) {
      const name = modules[i]
      const plugin = tempPluginModule[name]

      // @ts-ignore
      result.modules[name] = plugin

      // Setup state data
      if (plugin && plugin.state) {
        pluginState.push(plugin)
      }

      // Setup mock module methods
      for (const namedExport in plugin) {
        if (typeof plugin[namedExport] === 'function') {
          context.mock.method(plugin, namedExport)

          if (!namedExports[namedExport]){
            namedExports[namedExport] = plugin[namedExport]
          }
        }
      }
    }

    // Setup mock state
    const stateData = mockStateData(pluginState)
    const stateMethodNames = [
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

    stateMethodNames.forEach(methodName => {
      context.mock.method(state, methodName)
      result[methodName] = state[methodName]
      namedExports[methodName] = state[methodName]
    })

    state.setup(stateData)

    const mockContext = context.mock.module('#client', {
      namedExports
    })
    restoreCallbacks.push(() => {
      mockContext.restore()
      // deregister()
    })

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const pluginPath = normalize(`${__dirname}/../../../plugins/src/client/${name}.js`)
    const pluginURLPath = pathToFileURL(pluginPath).href
    const pluginModule = await import(pluginURLPath + `?seed=${crypto.randomUUID()}`)

    result.plugin = pluginModule[name]

    // Setup $action function for action plugin if included
    if (result.modules.action) {
      // Create a working $action function that can execute action methods
      const $action = mockActionMethod(result)

      // Call the action plugin's setup method to inject the $action function
      if (result.modules.action.setup) {
        result.modules.action.setup({ action: $action })
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
