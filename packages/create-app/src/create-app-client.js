import {
  component,
  icon,
  page,
  form
} from '@dooksa/plugins/client'
import {
  action,
  api,
  error,
  list,
  metadata,
  operator,
  regex,
  state,
  string,
  variable
} from '@dooksa/plugins/core'

import appendPlugin from './append-plugin.js'
import {
  base as defaultBaseComponents,
  extra as defaultExtraComponents,
  bootstrap as defaultBootstrapComponents
} from '@dooksa/components'
import { lazyLoader } from '../../plugins/src/lazy/index.js'

/**
 * @import { AppPlugin, AppComponent } from '#types'
 * @import { Component } from '@dooksa/create-component'
 */

/**
 * Creates a component collection manager.
 *
 * This helper function manages UI components, providing a registry for
 * component definitions and preventing duplicate component IDs.
 *
 * @returns {AppComponent} Component manager with use method and items getter
 * @example
 * // Create component manager
 * const componentManager = appendComponent()
 *
 * // Add components
 * componentManager.use(buttonComponent)
 * componentManager.use(formComponent)
 *
 * // Access components
 * const allComponents = componentManager.items
 * console.log(`Registered ${Object.keys(allComponents).length} components`)
 */
function appendComponent () {
  /** @type {Object.<string, Component>} */
  const components = {}

  return {
    /**
     * Adds a component to the collection.
     * @param {Component} component - Component definition to add
     * @throws {Error} If component with same ID already exists
     * @example
     * componentManager.use({
     *   id: 'button',
     *   name: 'Button',
     *   options: { variants: ['primary', 'secondary'] }
     * })
     */
    use (component) {
      if (components[component.id]) {
        throw new Error('Component already exists: ' + component.id)
      }

      components[component.id] = component
    },

    /**
     * Gets all registered components.
     * @returns {Object.<string, Component>} Map of component IDs to definitions
     * @example
     * const components = componentManager.items
     * const button = components['button']
     * if (button) {
     *   console.log(`Button component: ${button.name}`)
     * }
     */
    get items () {
      return components
    }
  }
}

/**
 * Creates a callback system for lazy-loading plugins when actions are needed.
 *
 * This function provides a mechanism to dynamically load plugins only when
 * their actions are first requested, improving initial load performance.
 *
 * @param {Object} app - Application context
 * @param {Object} app.actions - Registered action methods
 * @param {Object} app.lazy - Lazy plugin definitions
 * @param {Function} app.loader - Plugin loader function
 * @param {Object[]} app.setup - Setup queue
 * @param {Object} app.options - Application options
 * @param {Function} app.use - Plugin registration function
 * @example
 * // Create callback for lazy loading
 * const actionCallback = callbackWhenAvailable({
 *   actions: app.actions,
 *   lazy: app.lazy,
 *   loader: app.loader,
 *   setup: app.setup,
 *   options: app.options,
 *   use: app.use
 * })
 *
 * // Use callback to ensure plugin is loaded before action
 * actionCallback('auth_login', () => {
 *   // Action is now available
 *   app.actions.auth_login(params, context)
 * })
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
   * Callback function that loads plugins when actions are needed.
   *
   * @param {string} name - Name of the action method to ensure is available
   * @param {function} callback - Function to execute after plugin is loaded
   * @returns {any} Result of the callback function
   * @example
   * // Ensure auth plugin is loaded before calling login
   * actionCallback('auth_login', () => {
   *   return app.actions.auth_login(credentials)
   * })
   */
  return (name, callback) => {
    const pluginName = name.split('_', 1)[0]
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
 * Initializes the Dooksa client application with all configured plugins and components.
 *
 * This function sets up the client application by:
 * - Configuring action execution with lazy loading
 * - Setting up component registry
 * - Processing initial data from global scope
 * - Executing plugin setup functions
 *
 * @param {AppPlugin} appPlugins - Plugin manager
 * @param {AppComponent} appComponents - Component manager
 * @returns {Function} Initialization function that starts the client application
 * @example
 * // Initialize with managers
 * const init = initialize(pluginManager, componentManager)
 *
 * // Start the application
 * init({
 *   options: { /* config *\/ },
 *   lazy: { 'auth': './plugins/auth.js' },
 *   loader: (file) => import(file)
 * })
 */
function initialize (appPlugins, appComponents) {
  /**
   * Starts the Dooksa client application.
   *
   * @param {Object} param - Initialization parameters
   * @param {Object} [param.options={}] - Application configuration options
   * @param {Object} [param.lazy={}] - Lazy plugin definitions
   * @param {Function} [param.loader] - Plugin loader function
   * @example
   * // Start with lazy loading
   * init({
   *   options: { port: 3000 },
   *   lazy: {
   *     'payment': './plugins/payment.js'
   *   },
   *   loader: (fileName) => import(fileName)
   * })
   */
  return ({
    options = {},
    lazy = {},
    loader
  } = {
    loader: () => {
    }
  }) => {
    options.action = {
      lazyLoadAction: callbackWhenAvailable({
        actions: appPlugins.actions,
        lazy,
        loader,
        setup: appPlugins.setup,
        options,
        use: appPlugins.use
      }),
      actions: appPlugins.actions
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
      state.stateSetValue({
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
 * Creates and configures a Dooksa client application.
 *
 * This is the main entry point for creating client-side Dooksa applications.
 * It sets up plugin management, component registration, and provides options
 * for customizing which components are included.
 *
 * @param {Object} options - Application configuration options
 * @param {Object.<string, Component>} [options.components={}] - Override or add custom components
 * @param {boolean} [options.excludeExtraComponents=false] - Exclude extra components to reduce bundle size
 * @param {boolean} [options.excludeBootstrapComponents=false] - Exclude bootstrap components
 * @returns {Object} Client application instance with methods to extend and setup
 * @example
 * // Create client app with defaults
 * const app = createAppClient()
 *
 * @example
 * // Create app with custom components
 * const app = createAppClient({
 *   components: {
 *     'custom-button': customButtonComponent,
 *     'custom-form': customFormComponent
 *   }
 * })
 *
 * @example
 * // Create minimal app (exclude extra and bootstrap components)
 * const app = createAppClient({
 *   excludeExtraComponents: true,
 *   excludeBootstrapComponents: true
 * })
 *
 * @example
 * // Extend and setup the app
 * app.usePlugin(myPlugin)
 * app.useComponent(myComponent)
 *
 * // Initialize
 * app.setup({
 *   options: { /* config *\/ },
 *   lazy: { 'payment': './plugins/payment.js' },
 *   loader: (file) => import(file)
 * })
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

  // core plugins
  appPlugins.use(action)
  appPlugins.use(api)
  appPlugins.use(error)
  appPlugins.use(list)
  appPlugins.use(metadata)
  appPlugins.use(operator)
  appPlugins.use(regex)
  appPlugins.use(state)
  appPlugins.use(string)
  appPlugins.use(variable)

  // client plugins
  appPlugins.use(component)
  appPlugins.use(icon)
  appPlugins.use(page)
  appPlugins.use(form)

  return {
    usePlugin: appPlugins.use,
    useComponent: appComponents.use,
    setup: initialize(
      appPlugins,
      appComponents
    )
  }
}
