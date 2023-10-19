import DsPlugin from '@dooksa/ds-plugin'

/**
 * @typedef DsPluginOptions
 * @property {Object} option - Setup options
 * @property {string} option.name - Plugin name related to the options
 * @property {boolean} option.setupOnRequest - Load plugin when the plugin is requested by dsManager
 * @property {string} option.import - Name of plugin file to dynamically import
 * @property {Object} option.setup - Setup options to pass to the dooksa plugin
 * @property {Object} option.script - This is to load an external plugin (refer to {@link https://bitbucket.org/dooksa/resource-loader/src/master/README.md resource-loader})
 */

/**
 * This callback handles the plugin once loaded
 * @callback dsLoaderCallback
 * @returns {DsPlugin}
 */

/**
 * Dooksa plugin loader, this includes async loading and resolving dependencies management
 * @namespace dsLoader
 */
export default {
  name: 'dsLoader',
  version: 1,
  data: {
    context: {
      private: true,
      default: []
    },
    entryQueue: {
      private: true,
      default: []
    },
    lowPriority: {
      private: true,
      default: []
    },
    highPriority: {
      private: true,
      default: []
    },
    plugins: {
      private: true,
      default: {}
    },
    options: {
      private: true,
      default: {}
    },
    dependencyQueue: {
      private: true,
      default: []
    },
    hasDependencies: {
      private: true,
      default: []
    },
    subscribed: {
      private: true,
      default: {}
    },
    isPluginLoaded: {
      private: true,
      default: {}
    },
    listeners: {
      private: true,
      default: {}
    },
    totalPlugins: {
      private: true,
      default: 0
    },
    totalLoaded: {
      private: true,
      default: 0
    },
    callback: {
      private: true,
      default: () => {}
    }
  },
  /**
   *
   * @param {Object[]} plugins - List of DsPlugins
   * @param {string} plugins[].name - Name of plugin
   * @param {string} plugins[].version - Version of plugin
   * @param {DsPlugin} plugins[].value - Object used to create a DsPLugin
   * @param {DsPluginOptions} plugins[].options - Setup options
   * @param {Array}
   * @param {dsLoaderCallback} plugin.callback - This callback handles the plugin once loaded
   */
  setup ({ plugins, context, callback }) {
    this.context = context
    this.callback = callback

    const dependencies = []
    const priorityDependencies = []
    // create dsPlugins and sort plugin dependencies
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]

      if (plugin.value) {
        const dsPlugin = new DsPlugin(plugin.value, this.context, this.isDev)

        if (!plugin.options || (plugin.options && !plugin.options.setupOnRequest)) {
          this.entryQueue.push(plugin.name)
        }

        this._addData(dsPlugin, plugin.options)

        if (dsPlugin.dependencies) {
          if (!dsPlugin.contextMethods) {
            dependencies.push(dsPlugin.name)
          } else {
            priorityDependencies.push([dsPlugin.name, dsPlugin.dependencies])
          }
        }
      }
    }

    for (let i = 0; i < priorityDependencies.length; i++) {
      const [name, dependencies] = priorityDependencies[i]

      for (let i = 0; i < dependencies.length; i++) {
        const dependency = dependencies[i].name

        // remove dependent from low priority
        this.lowPriority = this.lowPriority.filter(item => item !== dependency)
        // make high priority listen for its dependent plugin
        this._subscribe(name, dependency)
      }
    }

    for (let i = 0; i < dependencies.length; i++) {
      const plugin = this.plugins[dependencies[i]]

      for (let i = 0; i < plugin.dependencies.length; i++) {
        this._subscribe(plugin.name, plugin.dependencies[i].name)
      }
    }

    // make all low priority dependent on high priority plugins
    for (let i = 0; i < this.highPriority.length; i++) {
      const dependency = this.highPriority[i]

      for (let i = 0; i < this.lowPriority.length; i++) {
        const name = this.lowPriority[i]

        this._subscribe(name, dependency)
      }
    }

    this._processQueue(this.entryQueue)
  },
  methods: {
    /**
     * Load plugin
     * @param {string} name - Name of plugin
     */
    load (name) {
      const options = this.options[name]

      if (options) {
        options.setupOnRequest = false
      }

      this._processQueue(this.entryQueue)
    },
    isLoaded (name) {
      return this.isPluginLoaded[name]
    },
    /**
     * Load all current plugins
     * @private
     * @param {string[]} - List of plugin names
     */
    _processQueue (queue) {
      for (let i = 0; i < queue.length; i++) {
        const name = queue[i]

        if (!this.dependencyQueue[name]) {
          this._use(this.plugins[name], this.options[name])
        }
      }
    },
    /**
     * Prepare plugin data for the loading processing
     * @private
     * @param {DsPlugin} plugin - DsPlugin instance
     * @param {DsPluginOptions} options - DsPlugin setup options
     */
    _addData (plugin, options) {
      const { name, contextMethods } = plugin

      this.callback(plugin)
      this.options[name] = options
      this.plugins[name] = plugin
      this.dependencyQueue[name] = 0
      this.subscribed[name] = {}
      this.listeners[name] = []
      this.totalPlugins += 1

      if (contextMethods) {
        this.highPriority.push(name)
        this.context = this.context.concat(contextMethods)
      } else {
        this.lowPriority.push(name)
      }
    },
    /**
     * Notify any plugin listeners to load
     * @private
     * @param {string} name - Name of plugin
     */
    _notify (name) {
      const listeners = this.listeners[name]

      for (let i = 0; i < listeners.length; i++) {
        const listener = listeners[i]

        if (this.dependencyQueue[listener] > 1) {
          this.dependencyQueue[listener] -= 1
        } else {
          this._use(this.plugins[listener], this.options[listener])
        }
      }
    },
    /**
     * Dynamically import an external plugin
     * @private
     * @param {string} fileName - The file name of the plugin to be loaded
     * @returns {Promise}
     */
    _import (fileName) {
      return new Promise((resolve, reject) => {
        import(`./plugins/${fileName}.js`)
          .then(({ default: plugin }) => {
            const dsPlugin = new this.DsPlugin(plugin, this.context, this.isDev)

            // add plugin to manager
            this._addData(dsPlugin)

            if (dsPlugin.dependencies) {
              for (let i = 0; i < plugin.dependencies.length; i++) {
                this._subscribe(plugin.name, plugin.dependencies[i].name)
              }
            }

            resolve(dsPlugin)
          })
          .catch(e => {
            this.callback(null, e)
            reject(e)
          })
      })
    },
    /**
     * Start the plugin setup process
     * @private
     * @param {DsPlugin} plugin - DsPlugin instance
     * @param {DsPluginOptions} options - DsPlugin setup options
     */
    _use (plugin, options = {}) {
      if (options.setupOnRequest) {
        return
      }

      if (options.import) {
        this._import(options.import)
          .then(plugin => {
            this._setup(plugin, options.setup)
          })
          .catch(error => {
            this.callback(null, error)
            throw error
          })
      } else {
        this._setup(plugin, options.setup)
      }
    },
    /**
     * Setup the plugin
     * @private
     * @param {DsPlugin} plugin - DsPlugin instance
     * @param {DsPluginOptions} options - DsPlugin setup options
     */
    _setup (plugin, options) {
      if (!plugin || plugin.constructor.name !== 'DsPlugin') {
        throw new Error('Not a valid plugin')
      }

      const setup = plugin.init(options)

      if (setup instanceof Promise) {
        setup
          .then(() => {
            this._setLoaded(plugin.name)
          })
          .catch(error => {
            this.callback(null, error)
            // Need to test how this fails
            throw error
          })
      } else {
        this._setLoaded(plugin.name)
      }
    },
    /**
     * Set plugin as loaded
     * @private
     * @param {string} name - Name of plugin
     */
    _setLoaded (name) {
      this.isPluginLoaded[name] = true
      this.totalLoaded += 1
      // plugin might not be in this list
      this.entryQueue = this.entryQueue.filter(item => item !== name)
      this._notify(name)
    },
    /**
     * Add plugin dependency
     * @private
     * @param {string} listener - The name of the plugin that will be waiting for it's dependent plugin to finish setting up before it runs its own setup process
     * @param {string} dependency - The name of the dependent plugin
     */
    _subscribe (listener, dependency) {
      if (this.isPluginLoaded[dependency] || this.subscribed[dependency][listener]) {
        return
      }

      const options = this.options[dependency]

      if (options) {
        options.setupOnRequest = false
      }

      this.dependencyQueue[listener] += 1
      this.listeners[dependency].push(listener)
      this.subscribed[dependency][listener] = true
    }
  }
}
