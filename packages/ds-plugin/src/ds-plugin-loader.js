import { definePlugin } from '@dooksa/utils'
import DsPlugin from './DsPlugin.js'

/** @typedef {import('@dooksa/utils/src/types.js').DsPluginData} DsPluginData */

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
 * @returns {DsPluginData}
 */

/**
 * Dooksa plugin loader, this includes async loading and resolving dependencies management
 */
export default definePlugin({
  name: 'dsLoader',
  version: 1,
  data: {
    context: {
      private: true,
      schema: {
        type: 'array'
      }
    },
    entryQueue: {
      private: true,
      schema: {
        type: 'array'
      }
    },
    lowPriority: {
      private: true,
      schema: {
        type: 'array'
      }
    },
    highPriority: {
      private: true,
      schema: {
        type: 'array'
      }
    },
    plugins: {
      private: true,
      schema: {
        type: 'object'
      }
    },
    options: {
      private: true,
      schema: {
        type: 'object'
      }
    },
    dependencyQueue: {
      private: true,
      schema: {
        type: 'array'
      }
    },
    hasDependencies: {
      private: true,
      schema: {
        type: 'array'
      }
    },
    subscribed: {
      private: true,
      schema: {
        type: 'object'
      }
    },
    isPluginLoaded: {
      private: true,
      schema: {
        type: 'object'
      }
    },
    listeners: {
      private: true,
      schema: {
        type: 'object'
      }
    },
    totalInQueue: {
      private: true,
      schema: {
        type: 'number'
      }
    }
  },
  /**
   *
   * @param {Object} plugins - List of DsPlugins
   * @param {string} plugins[].name - Name of plugin
   * @param {string} plugins[].version - Version of plugin
   * @param {DsPlugin} plugins[].value - Object used to create a DsPLugin
   * @param {DsPluginOptions} plugins[].options - Setup options
   * @param {dsLoaderCallback} plugin.onAdd - This callback handles the plugin once loaded
   * @param {dsLoaderCallback} plugin.onSuccess - This callback handles the plugin once loaded
   */
  setup ({
    plugins,
    context,
    callback = {
      onImport: () => {},
      onSuccess: () => {},
      onError: () => {}
    }
  }) {
    this.context = context

    const dependencies = []
    const priorityDependencies = []
    const entryQueue = []

    // create dsPlugins and sort plugin dependencies
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]

      // check if the plugin is a duplicate
      if (this.plugins[plugin.name]) {
        continue
      }

      if (plugin.value) {
        const dsPlugin = new DsPlugin(plugin.value)

        this._add(dsPlugin, plugin.options, callback.onImport)

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
        this._add(plugin, plugin.options, callback.onImport)
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
      const plugin = this.plugins[plugins[i].name]

      if (plugin._context) {
        plugin.setContext(this.context)
      }
    }

    this._processQueue(entryQueue, callback)
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
     * @param {dsLoaderCallback} callback - Add plugin callback
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
            const options = this.options[plugin.name]
            dsPlugin.setContext(this.context)

            // add plugin to manager
            this._add(dsPlugin, options, callback)

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
        this._import(options.import, callback.onImport)
          .then(plugin => {
            this._setup(plugin, options.setup, callback)
          })
          .catch(error => {
            callback.onError(error)
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
      if (!plugin || plugin.constructor !== DsPlugin) {
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
        this.lowPriority = []
        this.highPriority = []

        callback.onSuccess(this.context)
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
})
