import DsPlugin from '@dooksa/ds-plugin'
import dsLoader from '@dooksa/ds-plugin-loader'
import resource from '@dooksa/resource-loader'

/**
 * This callback is displayed as part of the Requester class.
 * @callback ActionCallback
 * @param {number} responseCode
 * @param {string} responseMessage
 */

const NAME = 'dsManager'
const VERSION = 1

/**
 * Ds plugin manager
 * @namespace dsManager
 */
export default {
  name: NAME,
  version: VERSION,
  data: {
    methods: {
      private: true,
      default: {}
    },
    tokens: {
      private: true,
      default: {}
    },
    tokenListeners: {
      private: true,
      default: {}
    },
    components: {
      private: true,
      default: {}
    },
    componentGetters: {
      private: true,
      default: {}
    },
    componentSetters: {
      private: true,
      default: {}
    },
    componentIgnoreAttr: {
      private: true,
      default: {}
    },
    buildId: {
      private: true,
      default: 0
    },
    isDev: {
      private: true,
      default: false
    },
    dsLoader: {
      private: true,
      default: {}
    }
  },
  /**
   * Setup plugin
   * @param {Object} setup - The variables needed to setup the plugin
   * @param {Object[]} setup.plugins - A list of base plugins
   * @param {string} setup.plugins[].name - The name of the plugin
   * @param {number} setup.plugins[].version - The version of the plugin
   * @param {dsPlugin} setup.plugins[].item - The plugin object
   * @param {DsPluginOptions} setup.plugins[].options - Options used by the plugin
   * @param {boolean} setup.isDev - Toggle development mode
   * @returns {Object} Development tools used by browser extension if it is enabled
   * @inner
   */
  setup ({
    plugins = [],
    isDev = false,
    onSuccess = () => {},
    onError = () => {}
  }) {
    const context = [
      {
        name: '$action',
        value: this._action.bind(this),
        export: true
      },
      {
        name: '$method',
        value: this._method.bind(this),
        export: true
      },
      {
        name: '$resource',
        value: resource
      },
      {
        name: 'isServer',
        value: typeof window === 'undefined',
        export: true
      },
      {
        name: 'isDev',
        value: isDev,
        export: true
      },
      {
        name: '$token',
        value: this._token.bind(this),
        scope: ['dsToken']
      },
      {
        name: '$component',
        value: this._component.bind(this),
        scope: ['dsComponent', 'dsView']
      },
      {
        name: '$componentGetters',
        value: this.componentGetters,
        scope: ['dsTemplate', 'dsView']
      },
      {
        name: '$componentSetters',
        value: this.componentSetters,
        scope: ['dsView']
      },
      {
        name: '$componentIgnoreAttr',
        value: this.componentIgnoreAttr,
        scope: ['dsTemplate']
      }
    ]

    this.dsLoader = new DsPlugin(dsLoader, context, isDev)

    // add dsPlugin
    this.dsLoader.init({
      plugins,
      context,
      callback: {
        onImport: this._add.bind(this),
        onSuccess: (context) => {
          const result = {}

          if (isDev) {
            result.components = this.components
          }

          // return context functions
          for (let i = 0; i < context.length; i++) {
            const method = context[i]

            if (method.export) {
              result[method.name] = method.value
            }
          }

          onSuccess(result)
        },
        onError: (error) => {
          onError(error)
          throw new Error(error)
        }
      }
    })
  },
  /** @lends dsManager */
  methods: {
    /**
     * Execute plugin methods
     * @param {string} name - Name of method
     * @param {Object|Array|string|number} params - Parameters for action
     * @param {}
     */
    _action (name, params, callback = {}) {
      this._callbackWhenAvailable(name, () => {
        const onSuccess = callback.onSuccess
        const onError = callback.onError
        const pluginResult = this.methods[name](params)

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
    },
    /**
     * Check if plugins method exists
     * @param {string} name - The name of plugins method
     * @returns boolean based on if the request plugin exists
     */
    _actionExists (name) {
      return !!this.methods[name]
    },
    /**
     * Adds the plugins methods to the manager
     * @param {DsPlugin} plugin - The plugin object
     */
    _add (plugin) {
      // add to build Id
      this.buildId += plugin.version

      if (plugin.methods) {
        for (const key in plugin.methods) {
          if (Object.hasOwn(plugin.methods, key)) {
            const method = plugin.methods[key]

            this.methods[`${plugin.name}/${key}`] = method
          }
        }
      }

      if (plugin.tokens) {
        for (const key in plugin.tokens) {
          if (Object.hasOwn(plugin.tokens, key)) {
            const token = plugin.tokens[key]

            if (token.get) {
              this.tokens[`${plugin.name}/${key}`] = token.get
              this.tokenListeners[`${plugin.name}/${key}`] = token.data
            } else {
              this.tokens[`${plugin.name}/${key}`] = token
            }
          }
        }
      }

      // ISSUE: [DS-756] Add catch if component exists
      if (plugin.components) {
        for (let i = 0; i < plugin.components.length; i++) {
          const component = plugin.components[i]
          const id = component.name

          this.components[id] = component
          this.components[id].plugin = plugin.name

          if (component.content) {
            if (component.content.get) {
              const ignoreAttributes = []
              this.componentGetters[id] = component.content.get

              for (let i = 0; i < component.content.get.length; i++) {
                const getter = component.content.get[i]

                if (getter.type === 'attribute') {
                  if (getter.value.name) {
                    ignoreAttributes.push(getter.value.name)
                  } else {
                    ignoreAttributes.push(getter.value)
                  }
                }
              }

              if (ignoreAttributes.length) {
                this.componentIgnoreAttr[id] = ignoreAttributes
              }
            }

            if (component.content.set) {
              this.componentSetters[id] = component.content.set
            }
          }
        }
      }

      // add getter/setters to data
      if (plugin.data) {
        for (let i = 0; i < plugin.data.length; i++) {
          const data = plugin.data[i]

          this.methods['dsData/add'](data)
        }
      }
    },
    _component (name) {
      const component = this.components[name]

      if (!component) {
        throw Error('No component found by the name of: ' + name)
      }

      // setup on request
      const isLoaded = this.dsLoader.methods.isLoaded(component.plugin)

      if (!isLoaded) {
        this.dsLoader.methods.get(component.plugin, (plugin, error) => {
          if (error) {
            throw error
          }

          this._add(plugin)
          this._component(name)
        })
      }

      // lazy load component
      if (component.isLazy && !component.isLoaded) {
        component.isLoaded = true

        component.lazy()
          .catch(e => console.error(e))
      }

      return component
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

      this.dsLoader.methods.get(pluginName, {
        onImport: this._add.bind(this),
        onSuccess: () => {
          callback()
        },
        onError: err => {
          console.log(err)
        }
      })
    },
    /**
     * Higher order function to allow plugins to run other plugins methods
     */
    _method (name, params) {
      try {
        if (this.methods[name]) {
          return this.methods[name](params)
        } else {
          // Check if the plugin needs to run setup
          throw new Error('Method "' + name + '" does not exist')
        }
      } catch (error) {
        console.error(name, error)
      }
    },
    _token (name, dsViewId, value) {
      if (this.tokens[name]) {
        if (this.tokenListeners[name]) {
          this.methods['dsData/addListener']({
            name: this.tokenListeners[name],
            on: 'update',
            refId: dsViewId,
            listener: () => {
              this.methods['dsView/updateValue']({ dsViewId })
            }
          })
        }

        return this.tokens[name](value)
      }
    }
  }
}
