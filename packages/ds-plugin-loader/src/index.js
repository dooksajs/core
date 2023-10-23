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
    totalInQueue: {
      private: true,
      default: 0
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
   * @param {dsLoaderCallback} plugin.onAdd - This callback handles the plugin once loaded
   * @param {dsLoaderCallback} plugin.onSuccess - This callback handles the plugin once loaded
   */
  setup ({ plugins, context, onAdd, onSuccess }) {
    this.context = context

    const dependencies = []
    const priorityDependencies = []
    const entryQueue = []

    // create dsPlugins and sort plugin dependencies
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]

      if (plugin.value) {
        const dsPlugin = new DsPlugin(plugin.value)

        this._add(dsPlugin, plugin.options, onAdd)

        if (dsPlugin.dependencies) {
          if (!dsPlugin.contextMethods) {
            dependencies.push(dsPlugin.name)
          } else {
            priorityDependencies.push([dsPlugin.name, dsPlugin.dependencies])
          }
        } else if (!plugin.options || (plugin.options && !plugin.options.setupOnRequest)) {
          entryQueue.push(plugin.name)
        }
      } else {
        // these plugins need to handle their dependencies once they are loaded
        this._add(plugin, plugin.options, onAdd)
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

    // set context to plugins
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]

      this.plugins[plugin.name].setContext(this.context)
    }

    this._processQueue(entryQueue, onSuccess)
  },
  methods: {
    /**
     * Load plugin
     * @param {string} name - Name of plugin
     */
    get (name, callback) {
      const options = this.options[name]

      if (options) {
        options.setupOnRequest = false
      }

      this._processQueue([name], callback)
    },
    isLoaded (name) {
      return this.isPluginLoaded[name]
    },
    /**
     * Load all current plugins
     * @private
     */
    _processQueue (items, callback) {
      for (let i = 0; i < items.length; i++) {
        const name = items[i]

        if (!this.dependencyQueue[name]) {
          this._use(this.plugins[name], this.options[name], callback)
        }
      }
    },
    /**
     * Prepare plugin data for the loading processing
     * @private
     * @param {DsPlugin} plugin - DsPlugin instance
     * @param {DsPluginOptions} options - DsPlugin setup options
     * @param {dsLoaderCallback} - Add plugin callback
     */
    _add (plugin, options, callback) {
      const name = plugin.name

      this.options[name] = options
      this.plugins[name] = plugin
      this.dependencyQueue[name] = 0
      this.subscribed[name] = {}
      this.listeners[name] = []

      if (!options || !options.setupOnRequest) {
        this.totalInQueue += 1
      }

      if (plugin.contextMethods) {
        this.highPriority.push(name)
        this.context = this.context.concat(plugin.contextMethods)
      } else {
        this.lowPriority.push(name)
      }

      // Add plugin callback
      callback(plugin)
    },
    /**
     * Notify any plugin listeners to load
     * @private
     * @param {string} name - Name of plugin
     */
    _notify (name, callback) {
      const listeners = this.listeners[name]

      for (let i = 0; i < listeners.length; i++) {
        const listener = listeners[i]

        if (this.dependencyQueue[listener] > 1) {
          this.dependencyQueue[listener] -= 1
        } else if (!this.isPluginLoaded[listener]) {
          this._use(this.plugins[listener], this.options[listener], callback)
        }
      }
    },
    /**
     * Dynamically import an external plugin
     * @private
     * @param {string} fileName - The file name of the plugin to be loaded
     * @returns {Promise}
     */
    _import (fileName, callback) {
      return new Promise((resolve, reject) => {
        import(`./plugins/${fileName}.js`)
          .then(({ default: plugin }) => {
            const dsPlugin = new DsPlugin(plugin)

            dsPlugin.setContext(this.context)

            // add plugin to manager
            this._add(dsPlugin, callback)

            if (dsPlugin.dependencies) {
              for (let i = 0; i < plugin.dependencies.length; i++) {
                this._subscribe(plugin.name, plugin.dependencies[i].name)
              }
            }

            resolve(dsPlugin)
          })
          .catch(e => {
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
    _use (plugin, options = {}, callback) {
      if (options.setupOnRequest) {
        return
      }

      if (options.import) {
        this._import(options.import)
          .then(plugin => {
            this._setup(plugin, options.setup, callback)
          })
          .catch(error => {
            callback(null, error)
          })
      } else {
        this._setup(plugin, options.setup, callback)
      }
    },
    /**
     * Setup the plugin
     * @private
     * @param {DsPlugin} plugin - DsPlugin instance
     * @param {DsPluginOptions} options - DsPlugin setup options
     */
    _setup (plugin, options, callback) {
      if (!plugin || plugin.constructor.name !== 'DsPlugin') {
        throw new Error('Not a valid plugin')
      }

      const setup = plugin.init(options)

      if (setup instanceof Promise) {
        setup
          .then(() => {
            this._setLoaded(plugin.name, callback)
          })
          .catch(error => {
            // Need to test how this fails
            throw error
          })
      } else {
        this._setLoaded(plugin.name, callback)
      }
    },
    /**
     * Set plugin as loaded
     * @private
     * @param {string} name - Name of plugin
     */
    _setLoaded (name, callback) {
      this.isPluginLoaded[name] = true
      // plugin might not be in this list
      this.totalInQueue -= 1

      if (this.totalInQueue === 0) {
        callback(this.context)
      }

      this._notify(name, callback)
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
