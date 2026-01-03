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
 * @property {metadata} metadata
 * @property {state} state
 * @property {editor} editor
 * @property {action} action
 * @property {component} component
 * @property {$fetch} fetch
 * @property {list} list
 * @property {event} event
 * @property {page} page
 * @property {operator} operator
 * @property {token} token
 * @property {query} query
 * @property {route} route
 * @property {icon} icon
 * @property {string} string
 * @property {form} form
 * @property {variable} variable
 * @property {regex} regex
 */

/**
 * @typedef {Object} MockStateMethods
 * @property {Mock<stateAddListener>} stateAddListener
 * @property {Mock<stateDeleteListener>} stateDeleteListener
 * @property {Mock<stateDeleteValue>} stateDeleteValue
 * @property {Mock<stateFind>} stateFind
 * @property {Mock<stateGenerateId>} stateGenerateId
 * @property {Mock<stateGetSchema>} stateGetSchema
 * @property {Mock<stateGetValue>} stateGetValue
 * @property {Mock<stateSetValue>} stateSetValue
 * @property {Mock<stateUnsafeSetValue>} stateUnsafeSetValue
 */

/**
 * @template {keyof MockClientPluginMap} Plugin
 * @typedef {{ [K in Plugin]: MockClientPluginMap[K] }} MockClientPluginMapper
 */

/**
 * @template {keyof MockClientPluginMap} Name
 * @template {keyof MockClientPluginMap} Plugin
 * @typedef {Object} MockPlugin
 * @property {MockClientPluginMap[Name]} plugin
 * @property {MockClientPluginMapper<Plugin>} modules
 * @property {Function} restore - Restore mock method
 */

/**
 * Validates plugin parameters
 * @param {Object} param
 * @param {string} param.name - Name of plugin
 * @param {'client' | 'server'} [param.platform='client'] - Platform
 * @param {string[]} [param.modules=[]] - List of plugins to mock
 * @param {Object.<string, Function>} [param.namedExports={}] - Named exports
 * @throws {Error} If required parameters are invalid
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
 * Mock a dooksa plugin
 * @template {keyof MockClientPluginMap} Name
 * @template {keyof MockClientPluginMap} Plugin
 * @param {TestContext} context - TestContext constructor
 * @param {Object} param
 * @param {Name} param.name - Name of plugin
 * @param {'client' | 'server'} [param.platform='client'] - Platform the plugin is intended to run on
 * @param {Plugin[]} [param.modules=[]] - List of plugins to mock
 * @param {Object.<string, Function>} [param.namedExports={}] - Named exports to mock
 * @returns {Promise<MockPlugin<Name, Plugin> & MockStateMethods>}
 * @example
 * // create mock fn
 * const actionDispatch = t.mock.fn((x) => x)
 * // mock test plugin
 * const mock = await mockPlugin(t, {
 *   name: 'event',
 *   namedExports: { actionDispatch: (x) => x },
 * })
 *
 * mock.stateSetValue({
 *   name: 'event/listeners',
 *   value: ['actionId']
 *   options: {
 *     id: 'eventId',
 *     prefixId: 'componentId'
 *   }
 * })
 *
 * // run metadata setup
 * mock.plugin.emit({
 *   name: 'eventId'
 *   id: 'componentId',
 * })
 *
 * strictEqual(actionDispatch.mock.callCount(), 1)
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
  /** @type {Partial<MockPlugin<Name, Plugin> & MockStateMethods> & { restore: () => void }} */
  const result = {
    modules: /** @type {MockClientPluginMapper<Plugin>} */ ({}),
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
          const mockResult = await mockPluginModule(context, moduleName, platform)

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
    const { plugin } = await mockPluginModule(context, name, platform)
    result.plugin = plugin

    return /** @type {MockPlugin<Name, Plugin> & MockStateMethods} */ (result)
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
