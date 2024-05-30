import { parseSchema, isServer } from '@dooksa/utils'
import {
  $setDataValue,
  lazyLoader
} from '@dooksa/plugins'

function appendPlugin (appPlugins, appSetup, appActions, appDataModels) {
  const use = (plugin) => {
    // check if plugin exists
    if (appPlugins.includes(plugin)) {
      const setup = plugin.setup
      // unshift setup
      if (setup) {
        appSetup = appSetup.filter(item => item.initialize !== setup)
      }

      return
    }

    // store plugin
    appPlugins.push(plugin)
    const { name, actions, models, dependencies, setup } = plugin

    if (setup) {
      appSetup.push({
        name,
        initialize: setup
      })
    }

    if (dependencies) {
      for (let i = 0; i < dependencies.length; i++) {
        use(dependencies[i])
      }
    }

    // extract actions
    if (actions) {
      for (const key in actions) {
        if (Object.hasOwnProperty.call(actions, key)) {
          appActions[name + '_' + key] = actions[key].bind(actions)
        }
      }
    }

    // extract data (need to parse and set default value)
    if (models) {
      for (const key in models) {
        if (Object.hasOwnProperty.call(models, key)) {
          const modelItem = models[key]
          const schemaType = modelItem.type
          let dataValue

          switch (schemaType) {
            case 'collection':
              dataValue = () => ({})
              break
            case 'object':
              dataValue = () => ({})
              break
            case 'array':
              dataValue = () => ([])
              break
            case 'string':
              dataValue = () => ('')
              break
            case 'number':
              dataValue = () => (0)
              break
            case 'boolean':
              dataValue = () => (true)
              break
          }

          // data namespace
          const collectionName = plugin.name + '/' + key
          const isCollection = schemaType === 'collection'

          appDataModels.values[collectionName] = dataValue()
          appDataModels.schema.push({
            name: collectionName,
            entries: parseSchema.process({}, collectionName, modelItem, [], true),
            isCollection
          })
        }
      }
    }
  }

  return use
}

function appendComponent (appComponents) {
  return (component) => {
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

    if (!isServer()) {
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
}

function initialize (appSetup, appActions, appComponents, appDataModels, use, appStartServer) {
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
    loader: () => {}
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
      action: (name, params, callback = {}) => {
        actionWhenAvailable(name, () => {
          const value = appActions[name](params)
          const onSuccess = callback.onSuccess
          const onError = callback.onError

          if (!onSuccess || !onError) {
            return value
          }

          if (value instanceof Error) {
            onError(value)
          } else if (value instanceof Promise) {
            Promise.resolve(value)
              .then(results => {
                onSuccess(results)
              })
              .catch(error => {
                onError(error)
              })
          } else {
            onSuccess(value)
          }
        })
      },
      availableMethod: (name) => {
        return typeof appActions[name] === 'function'
      }
    }

    // setup view components
    options.view = {
      components: (id) => {
        return appComponents[id]
      }
    }

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

    if (!isServer()) {
      // This is referring a global var
      // @ts-ignore
      const data = __ds__

      // set data
      for (let i = 0; i < data.item.length; i++) {
        const item = data.item[i]

        // need to check if any data requires an async plugin
        $setDataValue(item.collection, item.item, {
          id: item.id,
          metadata: item.metadata
        })
      }
    }

    // setup plugins
    for (let i = 0; i < appSetup.length; i++) {
      const setup = appSetup[i]

      setup.initialize(options[setup.name])
      appSetup.splice(i, 1)
      i--
    }

    appSetup = []

    if (isServer() && typeof appStartServer === 'function') {
      return appStartServer(options.server)
    }
  }
}

/**
 * Create Dooksa app
 * @param {Object} plugins
 */
function createApp ({ plugins = [], components = [] } = {}) {
  const appPlugins = []
  const appSetup = []
  const appActions = {}
  const appComponents = {}
  const appDataModels = {
    values: {},
    schema: []
  }
  let appStartServer
  const usePlugin = appendPlugin(appPlugins, appSetup, appActions, appDataModels)
  const useComponent = appendComponent(appComponents)

  for (let i = 0; i < plugins.length; i++) {
    const plugin = plugins[i]

    if (isServer() && plugin.name === 'http') {
      appStartServer = plugin.actions.start
    }

    usePlugin(plugin)
  }

  for (let i = 0; i < components.length; i++) {
    const component = components[i]

    useComponent(component)
  }

  return {
    usePlugin,
    useComponent,
    setup: initialize(appSetup, appActions, appComponents, appDataModels, usePlugin, appStartServer)
  }
}

export default createApp
