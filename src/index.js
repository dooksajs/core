import resource from '@dooksa/resource-loader'
import DsPlugin from '@dooksa/ds-plugin'

const NAME = 'dsManager'
const VERSION = 1

/**
 * Ds plugin manager
 * @module DsPlugin
 */
export default {
  name: NAME,
  version: VERSION,
  data: {
    _methods: {},
    _tokens: {},
    _components: {},
    buildId: '',
    plugins: {},
    pluginUseQueue: [],
    appBuildId: '',
    depQueue: {},
    queue: {},
    isLoaded: {},
    initialising: {},
    setupOnRequest: {},
    setupOnRequestQueue: {},
    options: {},
    context: {}
  },
  /**
   * Setup plugin
   * @param {Object} setup - The variables needed to setup the plugin
   * @param {number} setup.buildId - The build id for the current system
   * @param {Object[]} setup.plugins - A list of base plugins
   * @param {string} setup.plugins[].name - The name of the plugin
   * @param {number} setup.plugins[].version - The version of the plugin
   * @param {DsPlugin} setup.plugins[].plugin - The plugin object
   * @param {Object} setup.plugins[].options - Options used by the plugin
   * @param {boolean} setup.plugins[].options.setupOnRequest - Run the plugins setup function when its methods are used
   * @param {Object} setup.plugins[].options.setup - Params sent to the plugins setup function
   * @param {Object} setup.plugins[].options.script - This is to load an external plugin (refer to {@link https://bitbucket.org/dooksa/resource-loader/src/master/README.md resource-loader})
   * @param {boolean} setup.isDev - Toggle development mode
   * @returns {Object} Development tools used by browser extension if it is enabled
   */
  setup ({
    buildId,
    plugins = {},
    isDev
  }) {
    this.buildId = buildId
    this.context = [
      {
        name: '$action',
        value: this._action.bind(this)
      },
      {
        name: '$method',
        value: this._method.bind(this)
      },
      {
        name: '$resource',
        value: resource
      },
      {
        name: 'isDev',
        value: isDev
      },
      {
        name: '$token',
        value: this._token.bind(this),
        use: ['dsToken']
      },
      {
        name: '$component',
        value: this._component.bind(this),
        use: ['dsComponent', 'dsParse', 'dsElement']
      }
    ]
    // add dsManager
    this._add({
      name: NAME,
      version: VERSION,
      methods: {
        use: this.use
      }
    })

    this.isLoaded[NAME] = true

    for (const key in plugins) {
      if (Object.prototype.hasOwnProperty.call(plugins, key)) {
        this.use({}, { plugin: plugins[key] })
      }
    }

    this._processQueue()

    if (isDev) {
      return {
        $method: this._method.bind(this)(),
        $action: this._action.bind(this)()
      }
    }
  },
  methods: {
    /**
     * Add plugin to the manager
     * @param {*} context
     * @param {Object} item - @see this.setup plugin item
     */
    use ({ plugin, process }) {
      this._addOptions(plugin.name, plugin.options)
      this.plugins[plugin.name] = plugin
      this.pluginUseQueue.push(plugin)
      this.queue[plugin.name] = []
      this.depQueue[plugin.name] = []

      if (process) {
        this._processQueue()
      }
    },
    _processQueue () {
      for (let i = 0; i < this.pluginUseQueue.length; i++) {
        const item = this.pluginUseQueue[i]
        const queue = this._getQueue(item.name)

        if (!queue.length) {
          const loadingPlugin = this._install(item.name, item.plugin)
          // Add to plugin to queue
          this.queue[item.name] = [loadingPlugin]
        }
      }
    },
    /**
     * Higher order function to allow plugins to run other plugins async methods
     * @param {*} context
     * @returns
     */
    _action (context) {
      return (name, params, callback = {}) => {
        this._callbackWhenAvailable(name, () => {
          const onSuccess = callback.onSuccess
          const onError = callback.onError
          const pluginResult = this._methods[name](context, params)

          if (onError && pluginResult instanceof Error) {
            if (onError.method) {
              onError.method({ ...onError.params, results: pluginResult })
            } else {
              onError(pluginResult)
            }
          } else if (pluginResult instanceof Promise) {
            Promise.resolve(pluginResult)
              .then(results => {
                if (onSuccess) {
                  if (onSuccess.method) {
                    onSuccess.method({ ...onSuccess.params, results })
                  } else {
                    onSuccess(results)
                  }
                }
              })
              .catch(error => {
                if (onError) {
                  if (onError.method) {
                    onError.method({ ...onError.params, results: error })
                  } else {
                    onError(error)
                  }
                }
              })
          } else if (onSuccess) {
            if (onSuccess.method) {
              onSuccess.method({ ...onSuccess.params, results: pluginResult })
            } else {
              onSuccess(pluginResult)
            }
          }
        })
      }
    },
    /**
     * Check if plugins method exists
     * @param {string} name - The name of plugins method
     * @returns boolean based on if the request plugin exists
     */
    _actionExists (name) {
      return (this._methods[name])
    },
    /**
     * Adds the plugins methods to the manager
     * @param {DsPlugin} plugin - The plugin object
     */
    _add (plugin) {
      if (plugin.methods) {
        for (const key in plugin.methods) {
          if (Object.hasOwnProperty.call(plugin.methods, key)) {
            const method = plugin.methods[key]

            this._methods[`${plugin.name}/${key}`] = method
          }
        }
      }

      if (plugin.tokens) {
        for (const key in plugin.tokens) {
          if (Object.hasOwnProperty.call(plugin.tokens, key)) {
            const token = plugin.tokens[key]

            this._tokens[`${plugin.name}/${key}`] = token
          }
        }
      }

      // ISSUE: [DS-756] Add catch if component exists
      if (plugin.components) {
        for (let i = 0; i < plugin.components.length; i++) {
          const component = plugin.components[i]

          this._components[component.name] = { ...component, plugin: plugin.name }
        }
      }
    },
    /**
     * Store plugins setup options
     * @param {string} name - Name of the plugin
     * @param {Object} options - Setup object @see this.setup setup option
     */
    _addOptions (name, options = {}) {
      this.setupOnRequest[name] = !!options.setupOnRequest
      this.isLoaded[name] = false
      this.options[name] = options
    },
    _component (name) {
      if (this._components[name]) {
        const component = this._components[name]

        // setup on request
        if (!this.isLoaded[component.plugin] && this.setupOnRequestQueue[component.plugin]) {
          const pluginName = component.plugin
          const options = this._getOptions(pluginName)
          const plugin = this.setupOnRequestQueue[pluginName]

          this._setup(plugin, options.setup)
            .catch((e) => console.error(e))
        }

        if (component.isLazy && !component.loading) {
          component.loading = true
          component.lazy()
            .then(() => {
              component.loading = false
            })
            .catch(e => console.error(e))
        }

        return component
      }
    },
    /**
     * Get plugin
     * @param {string} - Name of plugin
     * @returns {DsPlugin} - Plugin object
     */
    _get (name) {
      return this.plugins[name] ? this.plugins[name].plugin : this.setupOnRequestQueue[name]
    },
    /**
     * Find and load plugin used by the @see action function
     * @param {string} name - Name of method
     * @param {function} callback - Callback used to run after loading the requested plugin
     * @returns returns callback return value if it is not async
     */
    _callbackWhenAvailable (name, callback) {
      const pluginName = name.split('/')[0]

      if (this.isLoaded[pluginName] && this._actionExists(name)) {
        return callback()
      }

      if (!this.initialising[pluginName]) {
        const plugin = this._get(pluginName)
        const loadingPlugin = this._install(pluginName, plugin, true)
        // add to loading queue
        this.queue[pluginName].push(loadingPlugin)

        loadingPlugin
          .then(() => {
            if (this._actionExists(name)) {
              callback()
            } else {
              console.error('action does not exist: ' + name)
            }
          })
          .catch(e => console.error(e))
      } else {
        // wait for installation to finish
        const queue = this._getQueue(pluginName)

        Promise.all(queue)
          .then(() => {
            if (this._actionExists(name)) {
              callback()
            } else {
              console.error('action does not exist: ' + name)
            }
          })
      }
    },
    _getQueue (name) {
      return this.queue[name] || []
    },
    /**
     * Get plugins setup options
     * @param {string} name - Name of plugin
     * @returns Setup options @see this.setup
     */
    _getOptions (name) {
      return this.options[name] || {}
    },
    /**
     * Install plugin and its dependencies
     * @param {string} name - Name of plugin
     * @param {DsPlugin} plugin - Dooksa plugin object
     * @param {Boolean} forceSetup - Force to run the plugins setup method
     * @returns Promise
     */
    _install (name, plugin, forceSetup = false) {
      return new Promise((resolve, reject) => {
        const options = this._getOptions(name)
        // set plugin loading process
        this.isLoaded[name] = false
        this.initialising[name] = true

        // lazy load plugin
        if (options.import) {
          if (!options.setupOnRequest || forceSetup) {
            import(`./plugins/${options.import}.js`)
              .then(({ default: plugin }) => {
                if (plugin.dependencies) {
                  this._installDependencies(name, plugin.dependencies)
                }

                const dsPlugin = new DsPlugin(plugin, this.context)

                // add plugin to manager
                this._add(dsPlugin)

                // run plugins setup
                this._setup(dsPlugin, options.setup)
                  .then(() => resolve(`Setup import ${name}`))
                  .catch((e) => reject(e))
              })
              .catch(e => reject(e))
          } else {
            this.initialising[name] = false
            return resolve(`Lazy loading ${name}`)
          }
        } else {
          let dsPlugin
          // fetch setup on request plugin
          if (this.setupOnRequestQueue[name]) {
            dsPlugin = this.setupOnRequestQueue[name]
          } else {
            dsPlugin = new DsPlugin(plugin, this.context)
            // add plugin to manager
            this._add(dsPlugin)
          }

          if (options.setupOnRequest && !forceSetup) {
            this.setupOnRequestQueue[name] = dsPlugin
            this.initialising[name] = false

            return resolve()
          }

          // install dependencies
          if (dsPlugin.dependencies) {
            this._installDependencies(name, dsPlugin.dependencies)
          }

          this._setup(dsPlugin, options.setup)
            .then(() => resolve(name))
            .catch((e) => reject(e))
        }
      })
    },
    /**
     * Install plugins dependencies
     * @param {string} name - Name of plugin
     * @param {Object[]} dependencies - A list of plugin dependencies
     */
    _installDependencies (name, dependencies) {
      for (let i = 0; i < dependencies.length; i++) {
        const plugin = dependencies[i]
        // Check if plugin is loaded
        if (!this.isLoaded[plugin.name]) {
          const depPlugin = this._use({
            name: plugin.name,
            options: {
              setupOnRequest: false
            }
          })
          // Add to plugin loading queue
          this.depQueue[name].push(depPlugin)
        }
      }
    },
    /**
     * Higher order function to allow plugins to run other plugins methods
     * @param {Object} context
     * @returns
     */
    _method (context) {
      return (name, params) => {
        try {
          if (this._methods[name]) {
            return this._methods[name](context, params)
          } else {
            // Check if the plugin needs to run setup
            throw new Error('Method "' + name + '" does not exist')
          }
        } catch (error) {
          console.error(name, error)
        }
      }
    },
    /**
     * Run plugins setup function
     * @param {DsPlugin} plugin - DsPlugin object
     * @param {Object} options - Plugins setup options
     * @returns Promise
     */
    _setup (plugin, options = {}) {
      return new Promise((resolve, reject) => {
        const queue = this.depQueue[plugin.name]

        Promise.all(queue)
          .then(() => {
            const setup = plugin.init(options)

            if (setup instanceof Promise) {
              setup
                .then(() => {
                  this.isLoaded[plugin.name] = true
                  this.initialising[plugin.name] = false
                  // remove from setup queue
                  delete this.setupOnRequestQueue[plugin.name]

                  console.log('Plugin successfully async loaded: ' + plugin.name)

                  resolve(plugin.name)
                })
                .catch(e => reject(e))
            } else {
              this.isLoaded[plugin.name] = true
              this.initialising[plugin.name] = false

              console.log('Plugin successfully loaded: ' + plugin.name)
              resolve(plugin.name)
            }
          })
          .catch(e => reject(e))
      })
    },
    _token (name, params) {
      if (this._tokens[name]) {
        return this._tokens[name](params)
      }
    },
    /**
     * Initialise the plugin installation
     * @param {Object} plugin
     * @param {string} plugin.name - Name of plugin
     * @param {object} plugin.option - Setup options for plugin
     * @returns Promise
     */
    _use ({ name, options = {} }) {
      // Return if plugin is loaded
      if (this.isLoaded[name]) {
        return Promise.resolve()
      }

      const plugin = this._get(name)
      const queue = this._getQueue(name)
      let forceSetup = false

      // Check if plugin is in loading queue and can run setup
      if (!this.initialising[name] && (!this.setupOnRequest[name] || !options.setupOnRequest)) {
        forceSetup = true
      }

      if (!queue || forceSetup) {
        const loadingPlugin = this._install(name, plugin, forceSetup)

        queue.push(loadingPlugin)

        return loadingPlugin
      }

      return Promise.resolve()
    }
  }
}
