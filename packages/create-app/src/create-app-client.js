import defaultPlugins, { stateSetValue, lazyLoader } from '@dooksa/plugins/client'
import appendPlugin from './append-plugin.js'
import {
  base as defaultBaseComponents,
  extra as defaultExtraComponents,
  bootstrap as defaultBootstrapComponents
} from '@dooksa/components'

/**
 * @import { AppPlugin } from '#types'
 * @import { Component } from '@dooksa/create-component'
 */

/**
 * @typedef {Object} AppComponent
 * @property {Function} use
 * @property {Object.<string, Component>} items
 */

function appendComponent () {
  /** @type {Object.<string, Component>} */
  const components = {}

  return {
    /**
     * @param {Component} component
     */
    use (component) {
      if (components[component.id]) {
        throw new Error('Component already exists: ' + component.id)
      }

      components[component.id] = component
    },
    get items () {
      return components
    }
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

      instance.setup(options[instance.name])
      setup.splice(i)
    }

    if (typeof actions[methodName] === 'function') {
      return callback()
    } else {
      throw new Error('No action exists by the name of: ' + methodName)
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

/**
 * @param {AppPlugin} appPlugins
 * @param {AppComponent} appComponents
 */
function initialize (appPlugins, appComponents) {
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
      actions: appPlugins.actions,
      lazy,
      loader,
      setup: appPlugins.setup,
      options,
      use: appPlugins.use
    })
    const appActions = appPlugins.actions

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
      components: appComponents.items
    }

    // setup database
    const appSetup = appPlugins.setup
    for (let i = 0; i < appSetup.length; i++) {
      const plugin = appSetup[i]

      if (plugin.name === 'state') {
        plugin.setup(appPlugins.state)

        // remove from setup queue
        appSetup.splice(i, 1)
        break
      }
    }

    // This is referring a global var
    // @ts-ignore
    const data = __ds

    // set data
    for (let i = 0; i < data.length; i++) {
      const item = data[i]

      // need to check if any data requires an async plugin
      stateSetValue({
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

    // clear setup queue
    appPlugins.setup = []
  }
}

/**
 * Create Dooksa app
 * @param {Object} options
 * @param {Object.<string, Component>} [options.components={}]
 * @param {boolean} [options.excludeExtraComponents]
 * @param {boolean} [options.excludeBootstrapComponents]
 */
export default function createAppClient ({
  components = {},
  excludeExtraComponents,
  excludeBootstrapComponents
} = {}) {
  const appPlugins = appendPlugin()
  const appComponents = appendComponent()

  // add base components
  for (let i = 0; i < defaultBaseComponents.length; i++) {
    let component = defaultBaseComponents[i]

    if (components[component.id]) {
      component = components[component.id]
    }

    appComponents.use(component)
  }

  // add extra components
  if (!excludeExtraComponents) {
    for (let i = 0; i < defaultExtraComponents.length; i++) {
      let component = defaultExtraComponents[i]

      if (components[component.id]) {
        component = components[component.id]
      }

      appComponents.use(component)
    }
  }

  // add bootstrap components
  if (!excludeBootstrapComponents) {
    for (let i = 0; i < defaultBootstrapComponents.length; i++) {
      let component = defaultBootstrapComponents[i]

      if (components[component.id]) {
        component = components[component.id]
      }

      appComponents.use(component)
    }
  }

  // use required client-side plugins
  for (let i = 0; i < defaultPlugins.length; i++) {
    appPlugins.use(defaultPlugins[i])
  }

  return {
    usePlugin: appPlugins.use,
    useComponent: appComponents.use,
    setup: initialize(
      appPlugins,
      appComponents
    )
  }
}
