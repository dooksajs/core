import { dataSetValue, lazyLoader } from '@dooksa/plugins/client'
import appendPlugin from './append-plugin.js'

function appendComponent (appComponents) {
  return (component) => {
    if (appComponents[component.id]) {
      throw new Error('Component already exists: ' + component.id)
    }

    appComponents[component.id] = component
  }
}

/**
 * Find and load plugin used by the @see action function
 * @param {Object} app - App
 * @param {Object} app.actions
 * @param {Object} app.lazy
 * @param {Function} app.loader
 * @param {Object[]} app.setup
 * @param {Object} app.options
 * @param {Function} app.use
 */
function callbackWhenAvailable ({ actions, lazy, loader, setup, options, use }) {
  const setupPlugin = (plugin, methodName, callback) => {
    use(plugin)

    for (let i = 0; i < setup.length; i++) {
      const instance = setup[i]

      instance.initialize(options[instance.name])
      setup.splice(i)
    }

    if (typeof actions[methodName] === 'function') {
      return callback()
    } else {
      throw new Error('No action exists by the name of: ' + name)
    }
  }

  /**
   * @param {string} name - Name of method
   * @param {function} callback - Callback used to run after loading the requested plugin
   */
  return (name, callback) => {
    if (typeof actions[name] === 'function') {
      return callback()
    }

    const pluginName = name.split('_')[0]
    const fileName = lazy[pluginName]

    // load custom plugins
    if (fileName) {
      return loader(fileName)
        .then(plugin => setupPlugin(plugin, name, callback))
        .catch(error => new Error(error))
    }

    // load core lazy plugins
    lazyLoader(pluginName)
      .then(plugin => {
        if (plugin) {
          setupPlugin(plugin, name, callback)
        }
      })
      .catch(error => new Error(error))
  }
}

function initialize (appSetup, appActions, appComponents, appDataModels, use) {
  /**
   * Initialize dooksa!
   * @param {Object} param
   * @param {Object} [param.options={}]
   * @param {Object} [param.lazy={}]
   * @param {Function} param.loader
   */
  return ({
    options = {},
    lazy = {},
    loader
  } = {
    loader: () => {
    }
  }) => {
    const actionWhenAvailable = callbackWhenAvailable({
      actions: appActions,
      lazy,
      loader,
      setup: appSetup,
      options,
      use
    })

    options.action = {
      action: (name, params, context, callback = {}) => {
        actionWhenAvailable(name, () => {
          const result = appActions[name](params, context)
          const onSuccess = callback.onSuccess
          const onError = callback.onError

          if (result instanceof Error) {
            onError(result)
          } else if (result instanceof Promise) {
            Promise.resolve(result)
              .then(results => {
                onSuccess(results)
              })
              .catch(error => {
                onError(error)
              })
          } else {
            onSuccess(result)
          }
        })
      }
    }

    // setup view components
    options.component = {
      component: (id) => {
        return appComponents[id]
      }
    }

    // setup database
    for (let i = 0; i < appSetup.length; i++) {
      const plugin = appSetup[i]

      if (plugin.name === 'data') {
        plugin.setup(appDataModels)

        // remove from setup queue
        appSetup.splice(i, 1)
        break
      }
    }

    // This is referring a global var
    // @ts-ignore
    const data = __ds

    // set data
    for (let i = 0; i < data.item.length; i++) {
      const item = data.item[i]

      // need to check if any data requires an async plugin
      dataSetValue({
        name: item.collection,
        value: item.item,
        options: {
          id: item.id,
          metadata: item.metadata
        }
      })
    }

    // setup plugins
    for (let i = 0; i < appSetup.length; i++) {
      const plugin = appSetup[i]

      plugin.setup(options[plugin.name])
      appSetup.splice(i, 1)
      i--
    }

    appSetup = []
  }
}

/**
 * Create Dooksa app
 * @param {Object} plugins
 */
export default function createAppClient ({
  plugins = [],
  components = []
} = {}) {
  const appPlugins = []
  const appSetup = []
  const appActions = {}
  const appComponents = []
  const appDataModels = {
    values: {},
    schema: [],
    names: []
  }
  const usePlugin = appendPlugin(appPlugins, appSetup, appDataModels, appActions)
  const useComponent = appendComponent(appComponents)

  for (let i = 0; i < components.length; i++) {
    useComponent(components[i])
  }

  for (let i = 0; i < plugins.length; i++) {
    usePlugin(plugins[i])
  }

  return {
    usePlugin,
    useComponent,
    setup: initialize(appSetup, appActions, appComponents, appDataModels, usePlugin)
  }
}
