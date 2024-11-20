import appendPlugin from './append-plugin.js'
import { data } from '@dooksa/plugins/client'
import {
  $http,
  middleware,
  action,
  metadata,
  database,
  component,
  event,
  page,
  theme,
  user
} from '@dooksa/plugins/server'

/** @import {Plugin, ActiveAction} from '../../create-plugin/src/index.js' */

function appendAction (appActionData) {
  return (action) => {
    appActionData.push(action)
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

    return $http.httpStart(options.http)
  }
}

/**
 * Create Dooksa app
 * @param {Object} data
 * @param {Plugin[]} [data.serverPlugins=[]]
 * @param {Plugin[]} [data.clientPlugins=[]]
 * @param {ActiveAction[]} [data.actions=[]]
 */
export default function createAppServer ({
  serverPlugins = [],
  clientPlugins = [],
  actions = []
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

  // add required server-side plugins
  usePlugin(data)
  usePlugin(middleware)
  usePlugin($http)
  usePlugin(metadata)
  usePlugin(user)
  usePlugin(database)
  usePlugin(action)
  usePlugin(component)
  usePlugin(event)
  usePlugin(page)
  usePlugin(theme)

  // add additional server-side plugins
  for (let i = 0; i < serverPlugins.length; i++) {
    const plugin = serverPlugins[i]

    usePlugin(plugin)
  }

  // add actions
  for (let i = 0; i < actions.length; i++) {
    useAction(actions[i])
  }

  // plugins used on the client-side
  for (let i = 0; i < clientPlugins.length; i++) {
    const plugin = clientPlugins[i]

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

  return {
    usePlugin,
    useAction,
    setup: initialize(appSetup, appActionData, appDataModels, appMetadata)
  }
}
