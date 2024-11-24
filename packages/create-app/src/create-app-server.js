import appendPlugin from './append-plugin.js'
import defaultClientPlugins, { data } from '@dooksa/plugins/client'
import defaultServerPlugins, { httpStart } from '@dooksa/plugins/server'
import defaultActions from '@dooksa/actions'

/**
 * @import {Plugin} from '../../create-plugin/src/index.js'
 * @import {Action} from '@dooksa/create-action/types'
 */

/**
 * @param {Action[]} appActionData
 */
function appendAction (appActionData) {
  /**
   * @param {Action} action
   */
  return (action) => {
    appActionData.push(action)
  }
}

/**
 * Append client plugins
 * @param {Object} appMetadata
 * @param {Array} appMetadata.actions
 * @param {Array} appMetadata.plugins
 */
function appendClientPlugin (appMetadata) {
  /**
   * @param {Plugin} plugin
   */
  return function (plugin) {
    if (plugin.metadata) {
      appMetadata.plugins.push({
        name: plugin.name,
        metadata: plugin.metadata
      })
    }

    if (plugin.actions) {
      appMetadata.actions = appMetadata.actions.concat(plugin.actions)
    }
  }
}

function initialize (appSetup, appActionData, appDataModels, appMetadata) {
  /**
   * Initialize server-side Dooksa!
   * @param {Object} param
   * @param {Object} [param.options={}]
   */
  return ({ options = {} }) => {
    options.data = appDataModels
    options.action = { actions: appActionData }
    options.metadata = appMetadata

    // setup plugins
    for (let i = 0; i < appSetup.length; i++) {
      const plugin = appSetup[i]

      plugin.setup(options[plugin.name])
      appSetup.splice(i, 1)
      i--
    }

    appSetup = []

    return httpStart(options.http)
  }
}

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
  const appPlugins = []
  const appSetup = []
  const appActionData = []
  const appMetadata = {
    plugins: [],
    actions: []
  }
  const appDataModels = {
    values: {},
    schema: [],
    names: []
  }
  const usePlugin = appendPlugin(appPlugins, appSetup, appDataModels)
  const useAction = appendAction(appActionData)
  const useClientPlugin = appendClientPlugin(appMetadata)

  // use data
  usePlugin(data)

  // use required server-side plugins
  for (let i = 0; i < defaultServerPlugins.length; i++) {
    const plugin = defaultServerPlugins[i]
    const name = plugin.name

    if (serverPlugins[name]) {
      usePlugin(serverPlugins[name])
    } else {
      usePlugin(plugin)
    }
  }

  // use required client-side plugins
  for (let i = 0; i < defaultClientPlugins.length; i++) {
    const plugin = defaultClientPlugins[i]
    const name = plugin.name

    if (clientPlugins[name]) {
      useClientPlugin(clientPlugins[name])
    } else {
      useClientPlugin(plugin)
    }
  }

  // use actions
  for (let i = 0; i < defaultActions.length; i++) {
    const action = defaultActions[i]
    const id = action.id

    if (actions[id]) {
      useAction(actions[id])
    } else {
      useAction(action)
    }
  }

  return {
    usePlugin,
    useClientPlugin,
    useAction,
    setup: initialize(appSetup, appActionData, appDataModels, appMetadata)
  }
}
