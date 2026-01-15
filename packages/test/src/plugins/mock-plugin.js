import { dirname, normalize } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { mockStateData } from './mock-state-data.js'
import {
  mockPluginExports,
  mockPluginActions
} from '../utils/index.js'
import { mockDatabaseSeed } from './mock-database-seed.js'
import { createRequest, createResponse, invokeRoute } from './mock-server-helpers.js'
import { createMockExpressModule, clearMockExpressModule } from './mock-express-module.js'
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
 * @typedef {Object} MockFetchResult
 * @property {Function} fetch - The mocked fetch function
 * @property {Array<Object>} requests - Array of fetch request tracking objects
 */

/**
 * @typedef {Object} MockPlugin
 * @property {MockPluginPlatform} client - Client plugins
 * @property {MockPluginPlatform} server - Server plugins
 * @property {MockExpressApp} app - Mock Express app with route tracking
 * @property {createRequest} createRequest - Helper to create mock Express request
 * @property {createResponse} createResponse - Helper to create mock Express response
 * @property {invokeRoute} invokeRoute - Manually invoke a registered route handler
 * @property {MockFetchResult} fetchMock - Mock fetch with request tracking
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
    _mockApp: {},
    get app () {
      return this._mockApp.app
    },
    createRequest,
    createResponse,
    invokeRoute: (path, request, response) => invokeRoute(result._mockApp.app, path, request, response),
    fetchMock: null,
    restore: () => {
      // Execute all restore callbacks in reverse order
      for (let i = restoreCallbacks.length - 1; i >= 0; i--) {
        try {
          restoreCallbacks[i]()
        } catch (error) {
          console.warn('Error during mock restoration:', error)
        }
      }
      // Clear the mock app after restore
      result._mockApp = {}
    }
  }

  // Track if we need to mock global.fetch
  let originalFetch = null

  try {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const seed = crypto.randomUUID()

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

      // restore internal context
      restoreCallbacks.push(() => plugin.restore())

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

    if (!serverModules.includes('server')) {
      serverModules.push('server')
    }

    let databaseSeedMockFilenames
    // Seed database
    if (seedData.length) {
      const databaseSeedMock = mockDatabaseSeed(context, seedData)

      databaseSeedMockFilenames = databaseSeedMock.filenames
      restoreCallbacks.push(() => databaseSeedMock.restore())
    }

    // Register the express mock BEFORE importing server modules
    const mockExpressModule = createMockExpressModule(context, result._mockApp)

    const expressMockContext = context.mock.module('express', {
      defaultExport: mockExpressModule
    })
    restoreCallbacks.push(() => {
      expressMockContext.restore()
      // Clear the global mock reference
      clearMockExpressModule()
    })

    // Import server modules AFTER express mock is registered
    const tempServerModule = await import('#server')

    // Create mock contexts for client modules only (server modules will be handled separately)
    if (mocksByModule['#client'] && Object.keys(mocksByModule['#client']).length > 0) {
      const clientMockContext = context.mock.module('#client', {
        namedExports: mocksByModule['#client']
      })
      restoreCallbacks.push(() => clientMockContext.restore())
    }

    // Handle server modules
    for (let i = 0; i < serverModules.length; i++) {
      const module = serverModules[i]
      let plugin
      let pluginName

      if (typeof module === 'string') {
        pluginName = module

        plugin = tempServerModule[pluginName]
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

      // restore internal context
      restoreCallbacks.push(() => plugin.restore())

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

    // Determine if it's a client or server plugin
    let pluginPath
    let pluginModule
    let pluginNamedExport = name

    try {
      pluginPath = normalize(`${__dirname}/../../../plugins/src/${platform}/${name}.js`)
      const pluginURLPath = pathToFileURL(pluginPath).href
      pluginModule = await import(pluginURLPath + '?seed=' + seed)
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

    restoreCallbacks.push(() => {
      plugin.restore()
    })

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

    // add seed data to database
    if (databaseSeedMockFilenames && tempServerModule.database) {
      for (const filename of databaseSeedMockFilenames) {
        await tempServerModule.database.databaseSeed(filename)
      }
    }

    let actionPlugin = tempClientModule.action
    if (name === 'action') {
      actionPlugin = plugin
    }
    // Setup action function for action plugin if included
    if (actionPlugin && typeof actionPlugin.setup === 'function') {
      result.client.setup.action = ({ actions, lazyLoadAction }) => {
        actionPlugin.setup({
          actions: {
            ...actionMethods,
            ...actions
          },
          lazyLoadAction
        })
      }
    }

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
