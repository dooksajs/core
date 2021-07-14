import DsPlugin from './Plugin'
import ScriptLoader from '@dooksa/script-loader'

function DsPlugins ({ isDev, store }) {
  // prepare global variable for plugin scripts
  window.pluginLoader = {}

  this._methods = {}
  this._getters = {}

  this.queue = {}
  this.isLoaded = {}
  this.onDemand = {}
  this.onDemandQueue = {}
  this.metadata = {}

  const method = this.method.bind(this)
  const action = this.action.bind(this)
  const getters = this.getters.bind(this)

  this.context = {
    isDev,
    store,
    ScriptLoader,
    action,
    method,
    getters
  }
}

DsPlugins.prototype.method = function (name, params) {
  if (this._methods[name]) {
    return this._methods[name](params)
  }
}

DsPlugins.prototype.action = function (name, params, callback = {}) {
  this.callbackWhenAvailable(name, () => {
    const onSuccess = callback.onSuccess
    const onError = callback.onError
    const pluginResult = this._methods[name](params)

    if (pluginResult instanceof Promise) {
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
              onError.method({ ...onError.params, results: pluginResult })
            } else {
              onError(pluginResult)
            }
            onError(error)
          }
        })
    } else if (onSuccess) {
      if (onSuccess.method) {
        return onSuccess.method({ ...onSuccess.params, results: pluginResult })
      } else {
        return onSuccess(pluginResult)
      }
    }
  })
}

DsPlugins.prototype.callbackWhenAvailable = function (name, callback) {
  if (this.actionExists(name)) {
    return callback()
  }

  const nameSplit = name.split('/')
  const baseName = nameSplit[0]

  if (this.queue[baseName] && !this.onDemand[baseName]) {
    this.isLoading(baseName).then(() => {
      if (this.actionExists(name)) {
        callback()
      } else {
        console.error('action does not exist: ' + name)
      }
    })
  } else if (this.onDemand[baseName]) {
    this.isLoading(baseName).then(() => {
      this.use({ name: baseName }).then(() => {
        if (this.actionExists(name)) {
          callback()
        } else {
          console.error('action does not exist: ' + name)
        }
      })
    })
  } else {
    this.use({ name: baseName }).then(() => {
      if (this.actionExists(name)) {
        callback()
      } else {
        console.error('action does not exist: ' + name)
      }
    })
  }
}

DsPlugins.prototype.actionExists = function (name) {
  return (this._methods[name] || this._getters[name])
}

DsPlugins.prototype.getters = function (name, params) {
  if (this._getters[name]) {
    return this._getters[name](params)
  }
}

DsPlugins.prototype.add = function (plugin) {
  if (plugin.methods) {
    for (const key in plugin.methods) {
      if (Object.hasOwnProperty.call(plugin.methods, key)) {
        const method = plugin.methods[key]

        this._methods[`${plugin.name}/${key}`] = method
      }
    }

    if (plugin.getters) {
      for (const key in plugin.getters) {
        if (Object.hasOwnProperty.call(plugin.getters, key)) {
          const getter = plugin.getters[key]

          this._getters[`${plugin.name}/${key}`] = getter
        }
      }
    }
  }
}

DsPlugins.prototype.addMetadata = function (data) {
  for (let i = 0; i < data.length; i++) {
    const name = data[i][0]
    const value = data[i][1]

    if (this.queue[name]) {
      delete this.queue[name]
    }

    this.isLoaded[name] = false
    this.metadata[name] = value
  }
}

DsPlugins.prototype.load = function (name, plugin) {
  return new Promise((resolve, reject) => {
    const nameFragments = name.split('/')
    const baseName = nameFragments[0]
    let setupOptions = {}
    let scriptOptions = {
      id: name
    }

    if (this.metadata[baseName]) {
      const metadata = this.metadata[baseName]

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
      resolve({ plugin, setupOptions })
    } else if (this.onDemandQueue[name]) {
      plugin = this.onDemandQueue[name]
      delete this.onDemandQueue[name]

      resolve({ plugin, setupOptions })
    }

    if (scriptOptions.src) {
      const script = new ScriptLoader(scriptOptions)

      script.load()
        .then(() => {
          const plugin = window.pluginLoader[name]

          if (plugin) {
            resolve({ plugin, setupOptions })
          } else {
            const error = new Error('Plugin was not found: ' + name)

            reject(error)
          }
        })
        .catch(error => reject(error))
    } else {
      const error = { statusCode: 404, message: 'Plugin not found: ' + name }

      reject(error)
    }
  })
}

DsPlugins.prototype.install = function (name, pluginImport, onDemand) {
  return new Promise((resolve, reject) => {
    this.isLoaded[name] = false
    this.onDemand[name] = !!onDemand

    this.load(name, pluginImport)
      .then(({ plugin, setupOptions }) => {
        const dsPlugin = new DsPlugin(this.context, plugin)
        const queue = []

        if (onDemand) {
          this.onDemandQueue[name] = plugin

          resolve()
        } else if (dsPlugin.dependencies) {
          const depQueue = []

          for (let i = 0; i < dsPlugin.dependencies.length; i++) {
            const depPlugin = this.use({ name: dsPlugin.dependencies[i].name })

            depQueue.push(depPlugin)
          }

          // wait for all dependencies to load
          Promise.all(depQueue)
            .then(() => {
              const setup = this.setup(dsPlugin, setupOptions)

              if (setup) {
                queue.push(setup)
              }

              // wait for plugin to setup
              Promise.all(queue)
                .then(() => {
                  this.add(dsPlugin)
                  this.isLoaded[name] = true

                  resolve()
                })
                .catch(e => reject(e))
            })
            .catch(e => reject(e))
        } else {
          const setup = this.setup(dsPlugin, setupOptions)

          if (setup) {
            queue.push(setup)
          }

          // wait for plugin to setup
          Promise.all(queue)
            .then(() => {
              this.add(dsPlugin)
              this.isLoaded[name] = true

              resolve()
            })
            .catch(e => reject(e))
        }
      })
      .catch(e => reject(e))
  })
}

DsPlugins.prototype.isLoading = function (name) {
  return Promise.all(this.queue[name])
}

DsPlugins.prototype.setup = function (dsPlugin, options) {
  const setup = dsPlugin.setup(options)

  if (setup instanceof Promise) {
    return setup
  }
}

DsPlugins.prototype.use = function ({ name, plugin, onDemand }) {
  if (this.isLoaded[name]) {
    return Promise.resolve()
  } else if (this.queue[name] && !this.onDemand[name]) {
    return this.isLoading(name)
  } else {
    const install = this.install(name, plugin, onDemand)

    this.queue[name] = [install]

    return install
  }
}

export default DsPlugins
