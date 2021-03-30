import DsPlugin from './Plugin'
import ScriptLoader from '@dooksa/script-loader'

function DsPlugins ({ isDev, store }) {
  // prepare global variable for plugin scripts
  if (!window.pluginLoader) {
    window.pluginLoader = {}
  }

  this._methods = {}
  this._commits = {}
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
  const [pluginName] = name.split('/')

  if ((this._methods[name] || this._commits[name] || this._getters[name])) {
    callback()
  } else if (this.queue[pluginName] && !this.onDemand[pluginName]) {
    this.isLoading(pluginName).then(() => {
      if (this._methods[name] || this._commits[name] || this._getters[name]) {
        callback()
      } else {
        console.error('action does not exist: ' + name)
      }
    })
  } else if (this.onDemand[pluginName]) {
    this.isLoading(pluginName).then(() => {
      this.use({ name: pluginName }).then(() => {
        if (this._methods[name] || this._commits[name] || this._getters[name]) {
          callback()
        } else {
          console.error('action does not exist: ' + name)
        }
      })
    })
  } else {
    this.use({ name: pluginName }).then(() => {
      if (this._methods[name] || this._commits[name] || this._getters[name]) {
        callback()
      } else {
        console.error('action does not exist: ' + name)
      }
    })
  }
}

DsPlugins.prototype.getters = function (name, params) {
  if (this._getters[name]) {
    return this._getters[name](params)
  }
}

DsPlugins.prototype.getCommitParams = function (name, data) {
  if (this._commits[name]) {
    return this._commits[name](data)
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

    if (plugin.commits) {
      for (const key in plugin.commits) {
        if (Object.hasOwnProperty.call(plugin.commits, key)) {
          const commit = plugin.commits[key]

          this._commits[`${plugin.name}/${key}`] = commit
        }
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
  for (const name in data) {
    if (Object.hasOwnProperty.call(data, name)) {
      const items = data[name].items

      if (this.metadata[name]) {
        this.metadata[name].items = { ...this.metadata[name].items, ...items }
        delete data[name]
      }
    }
  }

  this.metadata = { ...this.metadata, ...data }
}

DsPlugins.prototype.setCurrentVersion = function (name, version) {
  this.metadata[name].currentVersion = version
}

DsPlugins.prototype.load = function (name, version, plugin) {
  return new Promise((resolve, reject) => {
    let pluginId = version ? `${name}/v${version}` : name
    let setupOptions = {}
    const scriptOptions = {
      id: pluginId
    }

    if (this.metadata[name]) {
      const metadata = this.metadata[name]

      if (!version) {
        version = metadata.currentVersion
        pluginId = `${name}/v${version}`
      }

      const item = metadata.items[version]

      scriptOptions.src = item.src
      scriptOptions.id = pluginId

      if (item.setupOptions) {
        setupOptions = item.setupOptions
      } else if (metadata.setupOptions) {
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
          const plugin = window.pluginLoader[pluginId]

          if (plugin) {
            resolve({ plugin, setupOptions })
          } else {
            const error = new Error('Plugin was not found: ' + pluginId)

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

DsPlugins.prototype.install = function (name, version, pluginImport, onDemand) {
  return new Promise((resolve, reject) => {
    this.isLoaded[name] = false
    this.onDemand[name] = onDemand

    this.load(name, version, pluginImport)
      .then(({ plugin, setupOptions }) => {
        const dsPlugin = new DsPlugin(this.context, plugin)
        const queue = []

        if (onDemand) {
          this.onDemandQueue[name] = plugin

          resolve()
        } else if (dsPlugin.dependencies) {
          const depQueue = []

          for (let i = 0; i < dsPlugin.dependencies.length; i++) {
            const { name, version } = dsPlugin.dependencies[i]
            const depPlugin = this.use({ name: name, version: version })

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

DsPlugins.prototype.use = function ({ name, version, plugin, onDemand }) {
  if (this.isLoaded[name]) {
    return Promise.resolve()
  } else if (this.queue[name] && !this.onDemand[name]) {
    return this.isLoading(name)
  } else {
    const install = this.install(name, version, plugin, onDemand)

    this.queue[name] = [install]

    return install
  }
}

export default DsPlugins
