import appendPlugin from './append-plugin.js'
import { state } from '@dooksa/plugins/core'
import {
  component,
  icon,
  page,
  form
} from '@dooksa/plugins/client'
import {
  server,
  database,
  middleware,
  page as serverPage,
  theme,
  metadata as serverMetadata,
  component as serverComponent,
  event,
  user
} from '@dooksa/plugins/server'
import defaultActions from '@dooksa/actions'

const defaultServerPlugins = [
  server,
  database,
  middleware,
  serverPage,
  theme,
  serverMetadata,
  serverComponent,
  event,
  user
]

const defaultClientPlugins = [
  component,
  icon,
  page,
  form
]

/**
 * @import { DsPlugin, DsPluginMetadata, ActiveAction } from '../../create-plugin/types.js'
 * @import { AppPlugin, AppClientPlugin, AppAction, ServerPlugins, ClientPlugins } from '#types'
 * @import { Action } from '@dooksa/create-action'
 */

/**
 * Creates a reusable action collection manager.
 *
 * This helper function provides a simple interface for collecting and retrieving
 * action definitions during application setup.
 *
 * @returns {AppAction} Action manager with use method and items getter
 * @example
 * // Create action manager
 * const actionManager = appendAction()
 *
 * // Add actions
 * actionManager.use(loginAction)
 * actionManager.use(logoutAction)
 *
 * // Get all actions
 * const allActions = actionManager.items
 * console.log(`Collected ${allActions.length} actions`)
 */
function appendAction () {
  /** @type {Action[]} */
  const actions = []

  return {
    /**
     * Adds an action to the collection.
     * @param {Action} action - Action definition to add
     * @example
     * actionManager.use({
     *   id: 'user-login',
     *   name: 'login',
     *   method: (params, context) => {
     *     // Login logic implementation
     *     return { success: true }
     *   }
     * })
     */
    use (action) {
      actions.push(action)
    },

    /**
     * Gets all collected actions.
     * @returns {Action[]} Array of action definitions
     * @example
     * const actions = actionManager.items
     * actions.forEach(action => {
     *   console.log(`Action: ${action.name}`)
     * })
     */
    get items () {
      return actions
    }
  }
}

/**
 * Creates a client plugin collection manager.
 *
 * This helper function manages client-side plugins, collecting their metadata
 * and actions for the application.
 *
 * @returns {AppClientPlugin} Client plugin manager with use method and getters
 * @example
 * // Create client plugin manager
 * const clientPluginManager = appendClientPlugin()
 *
 * // Add plugins
 * clientPluginManager.use(authPlugin)
 * clientPluginManager.use(apiPlugin)
 *
 * // Access collected data
 * console.log(clientPluginManager.metadata)
 * console.log(clientPluginManager.actions)
 */
function appendClientPlugin () {
  /** @type {any[]} */
  let actions = []
  /** @type {Array<{name: string, metadata: DsPluginMetadata}>} */
  const metadata = []

  return {
    /**
     * Adds a client plugin to the collection.
     * @param {DsPlugin} plugin - Client plugin instance
     * @example
     * clientPluginManager.use({
     *   name: 'auth',
     *   metadata: { version: '1.0.0' },
     *   actions: [loginAction, logoutAction]
     * })
     */
    use (plugin) {
      if (plugin.metadata) {
        metadata.push({
          name: plugin.name,
          metadata: plugin.metadata
        })
      }

      if (plugin.actions) {
        actions = actions.concat(plugin.actions)
      }
    },

    /**
     * Gets collected plugin metadata.
     * @returns {Array<{name: string, metadata: DsPluginMetadata}>} Plugin metadata array
     * @example
     * const metadata = clientPluginManager.metadata
     * metadata.forEach(({ name, metadata }) => {
     *   console.log(`${name}: v${metadata.version}`)
     * })
     */
    get metadata () {
      return metadata
    },

    /**
     * Gets collected plugin actions.
     * @returns {Action[]} Array of actions from all plugins
     * @example
     * const actions = clientPluginManager.actions
     * console.log(`Total actions: ${actions.length}`)
     */
    get actions () {
      return actions
    }
  }
}

/**
 * Initializes the Dooksa application with all configured plugins and data.
 *
 * This function sets up the application by:
 * - Configuring state, actions, and metadata
 * - Executing plugin setup functions
 * - Starting the HTTP server
 *
 * @param {AppPlugin} serverPlugins - Server-side plugin manager
 * @param {AppClientPlugin} clientPlugins - Client-side plugin manager
 * @param {AppAction} actions - Action collection manager
 * @example
 * // Initialize with managers
 * const init = initialize(serverPluginManager, clientPluginManager, actionManager)
 *
 * // Start the application
 * const server = init({ options: { port: 3000 } })
 */
function initialize (serverPlugins, clientPlugins, actions) {
  /**
   * Starts the Dooksa server application.
   *
   * @param {Object} param - Initialization parameters
   * @param {Object} [param.options={}] - Application configuration options
   * @returns {Promise<Object>} HTTP server instance
   * @example
   * // Start with custom options
   * const server = init({
   *   options: {
   *     port: 8080,
   *     host: 'localhost',
   *     cors: { origin: '*' }
   *   }
   * })
   */
  return async ({ options = {} }) => {
    options.state = serverPlugins.state
    options.action = { actions: actions.items }
    options.metadata = {
      plugins: clientPlugins.metadata,
      actions: clientPlugins.actions
    }

    // setup plugins
    const appSetup = serverPlugins.setup

    for (let i = 0; i < appSetup.length; i++) {
      const plugin = appSetup[i]

      await plugin.setup(options[plugin.name])
    }

    // clear setup queue
    serverPlugins.setup = []

    return server.serverStart(options.server)
  }
}

/**
 * Creates and configures a Dooksa server application.
 *
 * This is the main entry point for creating server-side Dooksa applications.
 * It sets up plugin management, action collection, and component registration
 * with sensible defaults and customization options.
 *
 * @param {Object} options - Application configuration options
 * @param {ClientPlugins} [options.clientPlugins={}] - Override default client plugins
 * @param {ServerPlugins} [options.serverPlugins={}] - Override default server plugins
 * @param {Object.<string, Action>} [options.actions={}] - Override default actions
 * @example
 * // Create server app with defaults
 * const app = createAppServer()
 *
 * @example
 * // Create server app with custom plugins
 * const app = createAppServer({
 *   serverPlugins: {
 *     server: customHttpPlugin,
 *     database: customDbPlugin
 *   },
 *   clientPlugins: {
 *     api: customApiPlugin
 *   },
 *   actions: {
 *     'custom-action': customAction
 *   }
 * })
 *
 * @example
 * // Extend and setup the app
 * app.usePlugin(myPlugin)
 * app.useClientPlugin(myClientPlugin)
 * app.useAction(myAction)
 *
 * // Initialize and start
 * const server = app.setup({ options: { port: 3000 } })
 */
export default function createAppServer ({
  clientPlugins = {},
  serverPlugins = {},
  actions = {}
} = {}) {
  const appServerPlugins = appendPlugin()
  const appClientPlugins = appendClientPlugin()
  const appActions = appendAction()

  // use data
  appServerPlugins.use(state)

  const usedServerPlugins = {}

  // use required server-side plugins
  for (let i = 0; i < defaultServerPlugins.length; i++) {
    let plugin = defaultServerPlugins[i]
    const name = plugin.name

    if (serverPlugins[name]) {
      plugin = serverPlugins[name]
    }

    usedServerPlugins[name] = true
    appServerPlugins.use(plugin)
  }

  // use extra server-side plugins
  for (const name in serverPlugins) {
    if (!usedServerPlugins[name]) {
      appServerPlugins.use(serverPlugins[name])
    }
  }

  const usedClientPlugins = {}

  // use required client-side plugins
  for (let i = 0; i < defaultClientPlugins.length; i++) {
    let plugin = defaultClientPlugins[i]
    const name = plugin.name

    if (clientPlugins[name]) {
      plugin = clientPlugins[name]
    }

    usedClientPlugins[name] = true
    appClientPlugins.use(plugin)
  }

  // use extra client-side plugins
  for (const name in clientPlugins) {
    if (!usedClientPlugins[name]) {
      appClientPlugins.use(clientPlugins[name])
    }
  }

  const usedActions = {}

  // use actions
  for (let i = 0; i < defaultActions.length; i++) {
    let action = defaultActions[i]
    const id = action.id

    if (actions[id]) {
      action = actions[id]
    }

    usedActions[id] = true
    appActions.use(action)
  }

  // use extra actions
  for (const id in actions) {
    if (!usedActions[id]) {
      appActions.use(actions[id])
    }
  }


  const setup = initialize(
    appServerPlugins,
    appClientPlugins,
    appActions
  )

  return {
    usePlugin: appServerPlugins.use,
    useClientPlugin: appClientPlugins.use,
    useAction: appActions.use,
    setup
  }
}
