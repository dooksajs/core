import { dirname, normalize } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { mockStateData } from './mock-state-data.js'
import {
  mockPluginExports,
  mockPluginActions
} from '../utils/index.js'
import { mockDatabaseSeed } from './mock-database-seed.js'
import { createRequest, createResponse, invokeRoute } from './mock-server-helpers.js'
import { createMockExpressModule } from './mock-express-module.js'
import { createMockFetchForMockPlugin } from './mock-fetch-for-mock-plugin.js'

/**
 * @import {TestContext} from 'node:test'
 * @import {DsPluginExport} from '@dooksa/create-plugin/types'
 * @import {Mock} from 'node:test'
 * @import {MockExpressApp} from './mock-express-module.js'
 */

/**
 * @typedef {Object} MockPluginPlatform
 * @property {Object.<string, Mock<Function>>} methods - Map of exposed method names to their mock functions
 * @property {Object.<string, Mock<Function>>} actions - Map of exposed action names to their mock functions
 * @property {Object.<string, Mock<Function>>} method - Combined methods and actions
 * @property {Object.<string, Object>} schema - Map of plugin schemas
 * @property {Object.<string, Function>} setup - Map of setup functions (manual execution)
 */

/**
 * @typedef {Object} MockPlugin
 * @property {MockPluginPlatform} client - Client plugins
 * @property {MockPluginPlatform} server - Server plugins
 * @property {MockExpressApp} app - Mock Express app with route tracking
 * @property {createRequest} createRequest - Helper to create mock Express request
 * @property {createResponse} createResponse - Helper to create mock Express response
 * @property {invokeRoute} invokeRoute - Manually invoke a registered route handler
 * @property {Function} restore - Restore all mocks and clean up
 */

/**
 * @typedef {Object} MockPluginNamedExports
 * @property {module} module - name of the module
 * @property {string} name - name of the named export
 * @property {*} value - the value of the named export
 */

/**
 * @typedef {Object} SeedData
 * @property {string} collection - Collection name
 * @property {Object} item - Data items
 */

/**
 * Creates a complete mock environment for server plugins
 * @param {TestContext} context - Node.js TestContext for creating mocks
 * @param {Object} param - Configuration object
 * @param {string} param.name - Name of the primary plugin to mock
 * @param {string} [param.platform='client'] - Name of plugins platform
 * @param {Array<string|DsPluginExport<*,*,*,*>>} [param.serverModules=[]] - Additional server plugin names to mock
 * @param {Array<string|DsPluginExport<*,*,*,*>>} [param.clientModules=[]] - Client plugin names to mock (for isomorphic support)
 * @param {MockPluginNamedExports[]} [param.namedExports=[]] - Array of mock definitions
 * @param {SeedData[]} [param.seedData=[]] - Seed data for mock database
 * @returns {Promise<MockPlugin>} Complete mock server plugin environment
 */
export async function mockPlugin (
  context,
  {
    name,
    platform = 'client',
    serverModules = [],
    clientModules = [],
    namedExports = [],
    seedData = []
  }
) {
  // Group mock definitions by module
  const serverNamedExports = {}
  const clientNamedExports = {}
  const mocksByModule = {
    '#server': serverNamedExports,
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
  const mockApp = {}
  const result = {
    client: {
      methods: {},
      actions: {},
      setup: {},
      schema: {},
      get method () {
        return {
          ...this.methods,
          ...this.actions
        }
      }
    },
    server: {
      methods: {},
      actions: {},
      setup: {},
      schema: {},
      get method () {
        return {
          ...this.methods,
          ...this.actions
        }
      }
    },
    get app () {
      return mockApp.app
    },
    createRequest,
    createResponse,
    invokeRoute: (path, request, response) => invokeRoute(mockApp.app, path, request, response),
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

  // Track if we need to mock global.fetch
  let originalFetch = null

  try {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)

    // Mock express for http plugin
    if (serverModules.length || platform === 'server') {
      const mockExpressModule = createMockExpressModule(context, mockApp)

      const expressMockContext = context.mock.module('express', {
        defaultExport: mockExpressModule
      })
      restoreCallbacks.push(() => expressMockContext.restore())

      // load http with module context
      const httpPath = normalize(`${__dirname}/../../../plugins/src/server/http.js`)
      const httpURLPath = pathToFileURL(httpPath).href
      const httpModule = await import(httpURLPath)

      // Mock the imported plugin
      mockPluginExports(context, httpModule, serverNamedExports, result.server)
    }

    // Import client modules first (state is always required)
    const tempClientModule = await import('#client')
    const pluginState = []
    /** @type {Object.<string, Function>} */
    const actionMethods = {}

    // Ensure state is included
    if (!clientModules.includes('state')) {
      clientModules.push('state')
    }

    for (let i = 0; i < clientModules.length; i++) {
      const module = clientModules[i]
      let plugin
      let pluginName

      if (typeof module === 'string') {
        plugin = tempClientModule[module]
        pluginName = module

        if (pluginName === 'fetch') {
          plugin = tempClientModule['$fetch']
        }
      } else {
        plugin = module
        pluginName = module.name
      }

      if (!plugin) {
        throw new Error('Client module not found: "' + pluginName + '"')
      }

      // Mock client plugin exports
      mockPluginActions(context, plugin, clientNamedExports, result.client, actionMethods)
      mockPluginExports(context, plugin, clientNamedExports, result.client)

      // Populate schema and setup for the main plugin
      if (plugin && plugin.state) {
        pluginState.push(plugin)

        if (plugin.state.schema) {
          result.client.schema[pluginName] = plugin.state.schema
        }
      }

      // Store setup functions for manual execution (except state and client action)
      if (plugin && plugin.setup && pluginName !== 'state' && pluginName !== 'action') {
        result.client.setup[pluginName] = plugin.setup
      }
    }

    // Import server modules
    const tempServerModule = await import('#server')

    // Handle server modules
    for (let i = 0; i < serverModules.length; i++) {
      const module = serverModules[i]
      let plugin
      let pluginName

      if (typeof module === 'string') {
        plugin = tempServerModule[module]
        pluginName = module

        if (pluginName === 'http') {
          plugin = tempServerModule['$http']
        }
      } else {
        plugin = module
        pluginName = module.name
      }

      if (!plugin) {
        throw new Error('Server module not found: "' + module + '"')
      }

      // Mock server plugin exports
      mockPluginActions(context, plugin, serverNamedExports, result.server, actionMethods)
      mockPluginExports(context, plugin, serverNamedExports, result.server)

      // Populate schema and setup for the main plugin
      if (plugin && plugin.state) {
        pluginState.push(plugin)

        if (plugin.state.schema) {
          result.server.schema[pluginName] = plugin.state.schema
        }
      }

      // Store setup functions for manual execution
      if (plugin && plugin.setup) {
        result.server.setup[pluginName] = plugin.setup
      }
    }

    // Create mock contexts for each module BEFORE importing the actual plugins
    for (const [modulePath, moduleMocks] of Object.entries(mocksByModule)) {
      const mockContext = context.mock.module(modulePath, {
        namedExports: moduleMocks
      })
      restoreCallbacks.push(() => {
        mockContext.restore()
      })
    }

    // Determine if it's a client or server plugin
    let pluginPath
    let pluginModule
    let pluginNamedExport = name

    try {
      pluginPath = normalize(`${__dirname}/../../../plugins/src/${platform}/${name}.js`)
      const pluginURLPath = pathToFileURL(pluginPath).href
      pluginModule = await import(pluginURLPath + `?seed=${crypto.randomUUID()}`)

      // Handle special naming plugins
      if (name === 'http') {
        pluginNamedExport = '$http'
      } else if (name === 'fetch') {
        pluginNamedExport = '$fetch'
      }
    } catch (err) {
      const error = new Error(`Failed to find plugin "${name}" in form the "${platform}" platform \n\n ${err.message}`)
      error.stack = err.stack
      throw error
    }

    const plugin = pluginModule[pluginNamedExport]
    const platformResult = result[platform]
    const platformNamedExports = platform === 'client' ? clientNamedExports : serverNamedExports

    // Mock the imported plugin
    mockPluginActions(context, plugin, platformNamedExports, platformResult, actionMethods)
    mockPluginExports(context, plugin, platformNamedExports, platformResult)

    // Populate schema and setup for the main plugin
    if (plugin && plugin.state) {
      pluginState.push(plugin)

      if (plugin.state.schema) {
        platformResult.schema[name] = plugin.state.schema
      }
    }

    // Store setup functions for manual execution
    if (plugin && plugin.setup) {
      platformResult.setup[name] = plugin.setup
    }

    // Setup mock state for plugins
    const stateData = mockStateData(pluginState)
    // Setup app state
    tempClientModule.state.setup(stateData)

    // Setup action function for action plugin if included
    if (tempClientModule.action && typeof tempClientModule.action.setup === 'function') {
      tempClientModule.action.setup({ actions: actionMethods })
    }

    // Seed database
    if (seedData.length) {
      const databaseSeedMock = mockDatabaseSeed(context, seedData)

      restoreCallbacks.push(() => databaseSeedMock.restore())

      // load database with module context
      const databasePath = normalize(`${__dirname}/../../../plugins/src/server/database.js`)
      const databaseURLPath = pathToFileURL(databasePath).href
      const databaseModule = await import(databaseURLPath + `?seed=${crypto.randomUUID()}`)

      for (const filename of databaseSeedMock.filenames) {
        await databaseModule.databaseSeed(filename)
      }
    }

    // If testing fetch plugin, automatically mock global.fetch
    if ((name === 'fetch' && platform === 'client') || clientModules.includes('fetch')) {
      const mockFetch = createMockFetchForMockPlugin(result, context)

      // Store original fetch
      originalFetch = global.fetch

      // Mock global.fetch
      global.fetch = mockFetch.fetch

      // Add to restore callbacks
      restoreCallbacks.push(() => {
        if (originalFetch !== null) {
          global.fetch = originalFetch
          originalFetch = null
        }
      })

      // Add fetch mock to result for access in tests
      result.fetchMock = mockFetch
    }

    return result
  } catch (err) {
    // Clean up any partial mocks on error
    try {
      result.restore()
    } catch (cleanupError) {
      console.warn('Error during cleanup after failure:', cleanupError)
    }
    const error = new Error(`Failed to mock server plugin "${name}": ${err.message}`)
    error.stack = err.stack

    throw err
  }
}
