import appendPlugin from './append-plugin.js'
import defaultClientPlugins, { data } from '@dooksa/plugins/client'
import defaultServerPlugins, { httpStart } from '@dooksa/plugins/server'
import defaultActions from '@dooksa/actions'

/**
 * @import {Plugin, PluginMetadata, ActiveAction} from '../../create-plugin/src/index.js'
 * @import {AppPlugin} from './append-plugin.js'
 * @import {Action} from '@dooksa/create-action/types'
 */

/**
 * @typedef {Object} ServerPlugins
 * @property {Plugin} [data]
 * @property {Plugin} [middleware]
 * @property {Plugin} [http]
 * @property {Plugin} [metadata]
 * @property {Plugin} [user]
 * @property {Plugin} [database]
 * @property {Plugin} [action]
 * @property {Plugin} [component]
 * @property {Plugin} [event]
 * @property {Plugin} [page]
 * @property {Plugin} [theme]
 */

/**
 * @typedef {Object} ClientPlugins
 * @property {Plugin} [data]
 * @property {Plugin} [metadata]
 * @property {Plugin} [fetch]
 * @property {Plugin} [operator]
 * @property {Plugin} [action]
 * @property {Plugin} [variable]
 * @property {Plugin} [component]
 * @property {Plugin} [regex]
 * @property {Plugin} [editor]
 * @property {Plugin} [list]
 * @property {Plugin} [event]
 * @property {Plugin} [token]
 * @property {Plugin} [icon]
 * @property {Plugin} [query]
 * @property {Plugin} [route]
 * @property {Plugin} [form]
 * @property {Plugin} [string]
 * @property {Plugin} [page]
 */

/**
 * @typedef {Object} AppClientPlugin
 * @property {Function} use
 * @property {{ name: string, metadata: PluginMetadata }[]} metadata
 * @property {ActiveAction[]} actions
 */

/**
 * @typedef {Object} AppAction
 * @property {Function} use
 * @property {Action[]} items
 */

/**
 * Append actions
 * @returns {AppAction}
 */
function appendAction () {
  const actions = []

  return {
    /**
     * Use action
     * @param {Action} action
     */
    use (action) {
      actions.push(action)
    },
    /**
     * List of compiled actions
     * @returns {Action[]}
     */
    get items () {
      return actions
    }
  }
}

/**
 * Append client plugins
 * @returns {AppClientPlugin}
 */
function appendClientPlugin () {
  let actions = []
  const metadata = []

  return {
    /**
     * Use client side plugin
     * @param {Plugin} plugin
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
     * Collection of client plugin metadata
     */
    get metadata () {
      return metadata
    },
    /**
     * Collection of client plugin actions
     */
    get actions () {
      return actions
    }
  }
}

/**
 * Initialize Dooksa!
 * @param {AppPlugin} serverPlugins
 * @param {AppClientPlugin} clientPlugins
 * @param {AppAction} actions
 */
function initialize (serverPlugins, clientPlugins, actions) {
  /**
   * Initialize server-side Dooksa!
   * @param {Object} param
   * @param {Object} [param.options={}]
   */
  return ({ options = {} }) => {
    options.data = serverPlugins.models
    options.action = { actions: actions.items }
    options.metadata = {
      plugins: clientPlugins.metadata,
      actions: clientPlugins.actions
    }

    // setup plugins
    const appSetup = serverPlugins.setup

    for (let i = 0; i < appSetup.length; i++) {
      const plugin = appSetup[i]

      plugin.setup(options[plugin.name])
    }

    // clear setup queue
    serverPlugins.setup = []

    return httpStart(options.http)
  }
}

/**
 * Create Dooksa app
 * @param {Object} data
 * @param {ServerPlugins} [data.serverPlugins={}] - Overwrite core server plugins
 * @param {ClientPlugins} [data.clientPlugins={}] - Overwrite core client plugins
 * @param {Object.<string, Action>} [data.actions={}] - Overwrite core client plugins
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
  appServerPlugins.use(data)

  // use required server-side plugins
  for (let i = 0; i < defaultServerPlugins.length; i++) {
    let plugin = defaultServerPlugins[i]
    const name = plugin.name

    if (serverPlugins[name]) {
      plugin = serverPlugins[name]
    }

    appServerPlugins.use(plugin)
  }

  // use required client-side plugins
  for (let i = 0; i < defaultClientPlugins.length; i++) {
    let plugin = defaultClientPlugins[i]
    const name = plugin.name

    if (clientPlugins[name]) {
      plugin = clientPlugins[name]
    }

    appClientPlugins.use(plugin)
  }

  // use actions
  for (let i = 0; i < defaultActions.length; i++) {
    let action = defaultActions[i]
    const id = action.id

    if (actions[id]) {
      action = actions[id]
    }

    appActions.use(action)
  }

  return {
    usePlugin: appServerPlugins.use,
    useClientPlugin: appClientPlugins.use,
    useAction: appActions.use,
    setup: initialize(
      appServerPlugins,
      appClientPlugins,
      appActions
    )
  }
}
