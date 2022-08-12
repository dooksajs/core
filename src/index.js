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
    buildId: '',
    additionalPlugins: {},
    plugins: {},
    pluginUseQueue: [],
    appBuildId: '',
    appPlugins: [],
    appAdditionalPlugins: [],
    queue: {},
    isLoaded: {},
    setupOnRequest: {},
    setupOnRequestQueue: {},
    options: {},
    context: {}
  },
  /**
   * 
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
   * @param {Array} setup.additionalPlugins - A list of external plugins
   * @param {boolean} setup.isDev - Toggle development mode
   * @returns {Object} Development tools used by browser extension if it is enabled
   */
  setup ({
    buildId,
    plugins = [],
    additionalPlugins = [],
    isDev
  }) {
    this.buildId = buildId
    this.context = [
      {
        name: '$action',
        dispatch: true,
        value: this._action.bind(this)
      },
      {
        name: '$method',
        dispatch: true,
        value: this._method.bind(this)
      },
      {
        name: '$resource',
        dispatch: false,
        value: resource
      },
      {
        name: 'isDev',
        dispatch: false,
        value: isDev
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

    for (let i = 0; i < plugins.length; i++) {
      if (i === plugins.length - 1) {
        plugins[i].lastItem = true
      }

      this.use({}, plugins[i])
    }
    
    for (let i = 0; i < additionalPlugins.length; i++) {
      const item = additionalPlugins[i]

      if (i === additionalPlugins.length - 1) {
        item.lastItem = true
      }

      this.use({}, item)
    }

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
    use (context, item) {
      this._addOptions(item.name, item.options)
      this.plugins[item.name] = item 
      this.pluginUseQueue.push(item)
      this.queue[item.name] = []

      if (item.lastItem) {
        for (let i = 0; i < this.pluginUseQueue.length; i++) {
          const item = this.pluginUseQueue[i]
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
    /**
     * Get plugin
     * @param {string} - Name of plugin 
     * @returns {DsPlugin} - Plugin object
     */
    _get (name) {
      return this.plugins[name]
    },
    /**
     * Find and load plugin used by the @see action function 
     * @param {string} name - Name of method
     * @param {function} callback - Callback used to run after loading the requested plugin 
     * @returns returns callback return value if it is not async
     */
    _callbackWhenAvailable (name, callback) {
      if (this._actionExists(name)) {
        return callback()
      }

      const pluginName = name.split('/')[0]

      if (!this.isLoaded[pluginName]) {
        this._use({ name: pluginName, options: { setupOnRequest: false } }).then(() => {
          if (this._actionExists(name)) {
            callback()
          } else {
            console.error('action does not exist: ' + name)
          }
        })
      } else {
        console.error('action does not exist: ' + name)
      }
    },
    /**
     * Fetch external plugin
     * @param {string} name - Name of plugin
     * @param {Object} options - {@link https://bitbucket.org/dooksa/resource-loader/src/master/README.md resource-loader}
     * @returns Promise
     */
    _fetch (name, options) {
      return new Promise((resolve, reject) => {
        const error = { statusCode: 404, message: 'Plugin not found: '+ name }

        options.onSuccess = () => {
          const plugin = window.dsApp.plugins[name]
          // Make this a constant
          if (plugin) {
            resolve(plugin)
          } else {
            reject(error)
          }
        }

        options.onError = () => reject(error)

        resource.script(options)
      })
    },
    /**
     * Get plugins setup options
     * @param {string} name - Name of plugin 
     * @returns Setup options @see this.setup
     */
    _getOptions (name) {
      return this.options[name]
    },
    /**
     * Install plugin and its dependencies
     * @param {string} name - Name of plugin 
     * @param {DsPlugin} plugin - Dooksa plugin object
     * @param {Object} setup - Setup options @see this.setup
     * @returns Promise
     */
    _install (name, plugin, setup) {
      return new Promise((resolve, reject) => {
        const options = this._getOptions(name)

        this.isLoaded[name] = false
        // load plugin
        if (options.setupOnRequest && !setup) {
          this.setupOnRequestQueue[name] = plugin

          return resolve()
        }

        if (options.script) {
          return this._fetch(name, options.script)
            .then(plugin => {
              if (plugin.dependencies) {
                this._installDependencies(name, plugin.dependencies)
              }
      
              this._setup(plugin, options.setup)
                .then(() => resolve())
                .catch((e) => reject(e))
            })
        }
        // fetch setup on request plugin  
        if (this.setupOnRequestQueue[name]) {
          plugin = this.setupOnRequestQueue[name]
        }
        // install dependencies
        if (plugin.dependencies) {
          this._installDependencies(name, plugin.dependencies)
        }

        this._isLoading(name)
          .then(() => {
            this._setup(plugin, options.setup)
              .then(() => resolve())
              .catch((e) => reject(e))
          })
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
          const options = this._getOptions(plugin.name)
     
          if (!options.setupOnRequest) {
            this.queue[name].push(this.queue[plugin.name])
          } else {
            const depPlugin = this._use({
              name: plugin.name,
              options: {
                setupOnRequest: false
              }
            })
            // Add to plugin loading queue
            this.queue[name].push(depPlugin)
          }

        } 
      }
    },
    /**
     * Checks to see if the plugin is currently loading
     * @param {string} name The name of the plugin
     * @returns Promise
     */
    _isLoading (name) {
      const queue = this.queue[name]

      if (queue) {
        return Promise.all(this.queue[name])
      }

      return Promise.resolve()
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
          console.error(error)
        }
      }
    }
    /**
     * Run plugins setup function
     * @param {DsPlugin} plugin - DsPlugin object 
     * @param {Object} options - Plugins setup options
     * @returns Promise
     */
    _setup (plugin, options) {
      return new Promise((resolve, reject) => {
        const dsPlugin = new DsPlugin(plugin, this.context)
        const setup = dsPlugin.init(options)

        if (setup instanceof Promise) {
          setup
            .then(() => {
              this._add(dsPlugin)
              this.isLoaded[plugin.name] = true

              resolve()
            })
            .catch(e => reject(e))
        } else {
          this._add(dsPlugin)

          resolve()
        }
      })
    },
    /**
     * Initialise the plugin installation
     * @param {Object} plugin
     * @param {string} plugin.name - Name of plugin
     * @param {object} plugin.option - Setup options for plugin
     * @returns Promise
     */
    _use ({ name, options = {} }) {
      const plugin = this._get(name)
       // Return if plugin is loaded
       if (this.isLoaded[name]) {
        return Promise.resolve()
      }
      // Check if plugin is in loading queue and can run setup
      if (this.queue[name] && (this.setupOnRequest[name] === false || options.setupOnRequest === false)) {
        return this._install(name, plugin, true)
      }

      const loadingPlugin = this._install(name, plugin)

      this.queue[name].push(loadingPlugin)

      return loadingPlugin
    }
  }
}
