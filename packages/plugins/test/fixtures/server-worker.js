import { parentPort } from 'worker_threads'
import { server, database, middlewareSet } from '#server'
import { state } from '#core'
import { createPlugin } from '@dooksa/create-plugin'
import { mockStateData } from '@dooksa/test'
import { access } from 'fs/promises'
import { join } from 'path'
import { pathToFileURL } from 'url'

/**
 * @typedef {Object} PluginDefinition
 * @property {Object} instance - The plugin instance (module default export).
 * @property {Object} [setup] - Optional setup configuration for the plugin.
 */

/**
 * @typedef {Object} ServerConfig
 * @property {string[]} [routes] - Array of route paths to configure.
 * @property {string[]} [middleware] - Array of middleware names to apply.
 * @property {{ name: string, value: * }[]} [data] - Initial state data to populate.
 * @property {PluginDefinition[]} [plugins] - List of plugins to load.
 */

/**
 * Dynamically imports a plugin module from a relative path.
 * Verifies file access before attempting to import.
 *
 * @async
 * @param {string} path - The relative path to the plugin file from the current directory.
 * @returns {Promise<any>} The `default` export of the imported plugin module.
 * @throws {Error} If the file at the specified path cannot be accessed.
 */
async function importPlugin (path) {
  const pathname = join(import.meta.dirname, path)
  try {
    await access(pathname)
  } catch (error) {
    throw error
  }

  const pluginURL = pathToFileURL(pathname).href
  const pluginModule = await import(pluginURL)

  return pluginModule.default
}

/**
 * Main worker execution entry point.
 * Listens for messages from the parent thread to handle the server lifecycle.
 *
 * Supported commands:
 * - `start`: Loads plugins, configures the environment, and starts the server.
 * - `restore`: Stops the server and resets the state/database to the initial snapshot.
 * - `shutdown`: Stops the server and terminates the process.
 *
 * @returns {Promise<void>}
 */
async function run () {
  let plugins = []

  parentPort.on('message', async (message) => {
    switch (message.status) {
      case 'start':
        plugins = []

        for (let i = 0; i < message.plugins.length; i++) {
          const plugin = message.plugins[i]

          if (plugin.type === 'server') {
            const instance = await importPlugin(`../../src/server/${plugin.name}`)

            plugins.push({
              instance,
              setup: plugin.setup
            })
          } else if (plugin.type === 'fixture') {
            const instance = await importPlugin(`./plugins/${plugin.name}`)

            plugins.push({
              instance,
              setup: plugin.setup
            })
          } else {
            plugins.push(plugin)
          }
        }

        const serverInfo = await setupServer({
          routes: message.routes,
          middleware: message.middleware,
          data: message.data,
          plugins
        })

        parentPort.postMessage({
          status: 'ready',
          ...serverInfo
        })
        break

      case 'restore':
        await server.serverStop()
        state.restore()
        database.restore()
        server.restore()

        plugins.forEach((item) => {
          item.instance.restore()
        })

        parentPort.postMessage({
          status: 'restored'
        })
        break

      case 'shutdown':
        await server.serverStop()
        process.exit(0)
    }
  })
}

/**
 * Configures and starts the mock server environment.
 * Handles state mocking, middleware registration, route generation, and plugin initialization.
 *
 * @async
 * @param {ServerConfig} config - Configuration object.
 *
 * @returns {Promise<Object>} The server start information (e.g., port, address).
 */
async function setupServer ({ routes = [], middleware = [], data = [], plugins = [] }) {
  const pluginState = []
  const pluginSetup = []

  if (!plugins.length) {
    // Create default user plugin if no plugins provided
    const userPlugin = createPlugin('user', {
      state: {
        schema: {
          profiles: {
            type: 'collection',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' }
              }
            }
          }
        }
      }
    })

    pluginState.push(userPlugin, server)
  } else {
    let hasServer = false

    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]

      if (plugin.setup) {
        pluginSetup.push(plugin)
      }

      // include server plugin
      if (plugin.instance.name === 'server') {
        hasServer = true
      } else {
        pluginState.push(plugin.instance)
      }
    }

    if (!hasServer) {
      pluginState.push(server)
    }
  }
  // Setup state and server
  const stateExport = mockStateData(pluginState)
  state.setup(stateExport)
  server.setup()

  // Configure mock middleware
  for (const name of middleware) {
    middlewareSet({
      name,
      handler: (req, res, next) => next()
    })
  }

  // Configure routes
  for (const route of routes) {
    server.serverSetRoute({
      path: route,
      middleware: ['request/queryIdIsArray'],
      handlers: [database.databaseGetValue([route])]
    })
  }

  // Set state data
  for (const item of data) {
    state.stateSetValue({
      name: item.name,
      value: item.value,
      options: { replace: true }
    })
  }

  // Run plugin setup functions
  for (let i = 0; i < pluginSetup.length; i++) {
    const plugin = pluginSetup[i]
    await plugin.instance.setup(plugin.setup)
  }

  return await server.serverStart({ port: 0 })
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
