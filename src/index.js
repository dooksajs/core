import resource from '@dooksa/resource-loader'
import DsPlugin from '@dooksa/ds-plugin'

/**
 * Ds plugin manager
 * @module plugin
 */
export default {
  name: 'dsManager',
  version: 1,
  data: {
    _methods: {},
    buildId: '',
    additionalPlugins: {},
    plugins: {},
    appBuildId: '',
    appPlugins: [],
    appAdditionalPlugins: [],
    queue: {},
    isLoaded: {},
    setupOnRequest: {},
    setupOnRequestQueue: {},
    metadata: {},
    context: {}
  },
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

    this._add({
      name: this.name,
      version: this.version,
      methods: {
        use: this.use
      }
    })

    this.isLoaded[this.name] = true

    for (let i = 0; i < plugins.length; i++) {
      const data = plugins[i]

      this.plugins[data.item.name] = data.item.version
      this.use({}, data)
    }

    for (let i = 0; i < additionalPlugins.length; i++) {
      const data = additionalPlugins[i]

      this.additionalPlugins[data.item.name] = data.item.version
      this.use({}, data)
    }

    if (isDev) {
      return {
        $method: this._method.bind(this)(),
        $action: this._action.bind(this)()
      }
    }
  },
  methods: {
    use (context, { item, options = {}, plugin }) {
      if (options.onDemand) {
        return this._addMetadata(item)
      }

      if (this.isLoaded[item.name]) {
        return Promise.resolve()
      } else if (this.queue[item.name] && !this.setupOnRequest[item.name]) {
        return this._isLoading(item.name)
      } else {
        this._addMetadata(item)
        const loadingPlugin = this._install(item.name, plugin, options.setupOnRequest)
        this.queue[item.name] = [loadingPlugin]
      }
    },
    _actionExists (name) {
      return (this._methods[name])
    },
    _addMetadata (data) {
      if (this.queue[data.name]) {
        delete this.queue[data.name]
      }

      this.isLoaded[data.name] = false
      this.metadata[data.name] = data
    },
    _callbackWhenAvailable (name, callback) {
      if (this._actionExists(name)) {
        return callback()
      }

      const nameSplit = name.split('/')
      const baseName = nameSplit[0]

      if (this.queue[baseName] && !this.setupOnRequest[baseName]) {
        this._isLoading(baseName).then(() => {
          if (this._actionExists(name)) {
            callback()
          } else {
            console.error('action does not exist: ' + name)
          }
        })
      } else if (this.setupOnRequest[baseName]) {
        this._isLoading(baseName).then(() => {
          this.use({}, { item: { name: baseName } }).then(() => {
            if (this._actionExists(name)) {
              callback()
            } else {
              console.error('action does not exist: ' + name)
            }
          })
        })
      } else if (this.metadata[baseName]) {
        this.use({}, { item: { name: baseName } }).then(() => {
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
    _install (name, pluginImport, setupOnRequest) {
      return new Promise((resolve, reject) => {
        this.isLoaded[name] = false
        this.setupOnRequest[name] = !!setupOnRequest

        this._load(name, pluginImport)
          .then(({ plugin, setupOptions }) => {
            const queue = []

            if (setupOnRequest) {
              this.setupOnRequestQueue[name] = plugin

              return resolve()
            } else if (plugin.dependencies) {
              const depQueue = []

              for (let i = 0; i < plugin.dependencies.length; i++) {
                const depPlugin = this.use({}, {
                  item: {
                    name: plugin.dependencies[i].name,
                    version: plugin.dependencies[i].version
                  }
                })

                depQueue.push(depPlugin)
              }

              // wait for all dependencies to load
              Promise.all(depQueue)
                .then(() => {
                  const dsPlugin = new DsPlugin(plugin, this.context)
                  const setup = this._setup(dsPlugin, setupOptions)

                  if (setup) {
                    queue.push(setup)
                  }

                  // wait for plugin to setup
                  Promise.all(queue)
                    .then(() => {
                      this._add(dsPlugin)
                      this.isLoaded[name] = true

                      resolve()
                    })
                    .catch(e => reject(e))
                })
                .catch(e => reject(e))
            } else {
              const dsPlugin = new DsPlugin(plugin, this.context)
              const setup = this._setup(dsPlugin, setupOptions)

              if (setup) {
                queue.push(setup)
              }

              // wait for plugin to setup
              Promise.all(queue)
                .then(() => {
                  this._add(dsPlugin)
                  this.isLoaded[name] = true

                  resolve()
                })
                .catch(e => reject(e))
            }
          })
          .catch(e => reject(e))
      })
    },
    /**
     * Checks to see if the plugin is currently loading
     * @param {string} name The name of the plugin
     * @returns Promise
     */
    _isLoading (name) {
      return Promise.all(this.queue[name])
    },
    _load (name, plugin) {
      return new Promise((resolve, reject) => {
        let setupOptions = {}
        let scriptOptions = {
          id: name
        }

        if (this.metadata[name]) {
          const metadata = this.metadata[name]

          if (!metadata) {
            const error = { statusCode: 404, message: 'Plugin not found: ' + name }
            reject(error)
          }

          if (metadata.script) {
            scriptOptions = { ...scriptOptions, ...metadata.script }
          }

          if (metadata.setupOptions) {
            setupOptions = metadata.setupOptions
          }
        }

        if (plugin) {
          return resolve({ plugin, setupOptions })
        } else if (this.setupOnRequestQueue[name]) {
          plugin = this.setupOnRequestQueue[name]
          delete this.setupOnRequestQueue[name]

          return resolve({ plugin, setupOptions })
        }

        const error = { statusCode: 404, message: 'Plugin not found: ' + name }

        if (scriptOptions.src) {
          scriptOptions.onSuccess = () => {
            const plugin = window.dsApp.plugins[name]

            if (plugin) {
              return resolve({ plugin, setupOptions })
            } else {
              const error = new Error('Plugin was not found: ' + name)

              return reject(error)
            }
          }

          scriptOptions.onError = () => reject(error)

          resource.script(scriptOptions)
        } else {
          reject(error)
        }
      })
    },
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
    _setup (plugin, options) {
      const setup = plugin.init(options)

      if (setup instanceof Promise) {
        return setup
      }
    },
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
  }
}
