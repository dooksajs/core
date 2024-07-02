import appendPlugin from './append-plugin.js'

function appendMetadata (appMetadata) {
  return (metadata) => {
    appMetadata.push(metadata)
  }
}

function appendAction (appActionData) {
  return (action) => {
    appActionData.push(action)
  }
}

function initialize (appSetup, appActionData, appDataModels, appStartServer, appMetadata) {
  /**
   * Initialize server-side Dooksa!
   * @param {Object} param
   * @param {Object} [param.options={}]
   */
  return ({ options = {} }) => {
    // setup database
    for (let i = 0; i < appSetup.length; i++) {
      const setup = appSetup[i]

      if (setup.name === 'data') {
        setup.initialize(appDataModels)

        // remove from setup queue
        appSetup.splice(i, 1)
        break
      }
    }

    options.action = {
      actions: appActionData
    }
    options.metadata = {
      metadata: appMetadata
    }

    // setup plugins
    for (let i = 0; i < appSetup.length; i++) {
      const setup = appSetup[i]

      setup.initialize(options[setup.name])
      appSetup.splice(i, 1)
      i--
    }

    appSetup = []

    return appStartServer(options.server)
  }
}

/**
 * Create Dooksa app
 * @param {Object} plugins
 */
function createAppServer ({ plugins = [], clientPlugins = [], actions = [] } = {}) {
  const appPlugins = []
  const appSetup = []
  const appActionData = []
  const appMetadata = []
  const appDataModels = { values: {}, schema: [] }
  const usePlugin = appendPlugin(appPlugins, appSetup, appDataModels)
  const useAction = appendAction(appActionData)
  const useMetadata = appendMetadata(appMetadata)
  let appStartServer

  for (let i = 0; i < plugins.length; i++) {
    const plugin = plugins[i]

    if (plugin.name === 'http') {
      appStartServer = plugin.actions.start
    }

    usePlugin(plugin)
  }

  for (let i = 0; i < actions.length; i++) {
    useAction(actions[i])
  }


  for (let i = 0; i < clientPlugins.length; i++) {
    const plugin = clientPlugins[i]

    if (plugin.metadata) {
      appendMetadata(plugin.metadata)
    }
  }

  return {
    usePlugin,
    useAction,
    useMetadata,
    setup: initialize(appSetup, appActionData, appDataModels, appStartServer, appMetadata)
  }
}

export default createAppServer
