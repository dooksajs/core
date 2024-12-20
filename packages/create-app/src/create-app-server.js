import appendPlugin from './append-plugin.js'
import defaultClientPlugins, { state } from '@dooksa/plugins/client'
import defaultServerPlugins, { httpStart } from '@dooksa/plugins/server'
import defaultActions from '@dooksa/actions'

/**
 * @import { DsPlugin, DsPluginMetadata, ActiveAction } from '../../create-plugin/types.js'
 * @import { AppPlugin } from '#types'
 * @import { Action } from '@dooksa/create-action/types'
 */

/**
 * @typedef {Object} ServerPlugins
 * @property {DsPlugin} [state]
 * @property {DsPlugin} [middleware]
 * @property {DsPlugin} [http]
 * @property {DsPlugin} [metadata]
 * @property {DsPlugin} [user]
 * @property {DsPlugin} [database]
 * @property {DsPlugin} [action]
 * @property {DsPlugin} [component]
 * @property {DsPlugin} [event]
 * @property {DsPlugin} [page]
 * @property {DsPlugin} [theme]
 */

/**
 * @typedef {Object} ClientPlugins
 * @property {DsPlugin} [state]
 * @property {DsPlugin} [metadata]
 * @property {DsPlugin} [fetch]
 * @property {DsPlugin} [operator]
 * @property {DsPlugin} [action]
 * @property {DsPlugin} [variable]
 * @property {DsPlugin} [component]
 * @property {DsPlugin} [regex]
 * @property {DsPlugin} [editor]
 * @property {DsPlugin} [list]
 * @property {DsPlugin} [event]
 * @property {DsPlugin} [token]
 * @property {DsPlugin} [icon]
 * @property {DsPlugin} [query]
 * @property {DsPlugin} [route]
 * @property {DsPlugin} [form]
 * @property {DsPlugin} [string]
 * @property {DsPlugin} [page]
 */

/**
 * @typedef {Object} AppClientPlugin
 * @property {Function} use
 * @property {{ name: string, metadata: DsPluginMetadata }[]} metadata
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
     * @param {DsPlugin} plugin
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
  appServerPlugins.use(state)

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
