import DsPlugin from './Plugin'
import ScriptLoader from '@dooksa/script-loader'
import basePluginMetadata from './basePlugins'

function DsPlugins ({ isDev, siteId }) {
  // prepare global variable for plugin scripts
  if (!window.pluginLoader) {
    window.pluginLoader = {}
  }

  this._methods = {}
  this.isDev = isDev
  this.queue = {}
  this.isLoaded = {}
  this.sitePluginsLoaded = false
  this.sitePluginsLoading = []
  this.pluginMetadata = { ...basePluginMetadata }
  this.hostName = window.location.hostname

  // load required plugins
  // TODO merge required plugins into one
  this.use({ name: 'dsFirebaseAuth' })
  this.use({ name: 'dsFirebaseFirestore' })

  // remove condition when DOOKSA-223 is resolved
  if (!isDev) {
    this.use({ name: 'dsFirebaseAnalytics' })
    this.use({ name: 'dsFirebasePerformance' })
  }

  this.sitePluginsLoading = new Promise((resolve, reject) => {
    this.callbackWhenAvailable('dsFirebaseFirestore', () => {
      this._methods.dsFirebaseFirestore.getDocs({
        query: {
          path: ['sites'],
          options: {
            where: [{
              path: 'domains',
              op: 'array-contains',
              value: this.hostName
            }]
          }
        }
      })
        .then((results) => {
          const doc = results[0]

          this.pluginMetadata = { ...this.pluginMetadata, ...doc.plugins }

          resolve()
        })
        .catch((e) => reject(e))
    })
  })
}

DsPlugins.prototype.action = function ({ pluginName, methodName, params, callback = Function }) {
  this.callbackWhenAvailable(pluginName, () => {
    const action = this._methods[pluginName][methodName](params)

    if (action instanceof Promise) {
      Promise.resolve(action).then((result) => callback(result))
    } else {
      callback(action)
    }
  })
}

DsPlugins.prototype.add = function (plugin) {
  if (plugin.methods) {
    this._methods[plugin.name] = {}

    for (const key in plugin.methods) {
      if (Object.hasOwnProperty.call(plugin.methods, key)) {
        const method = plugin.methods[key]

        this._methods[plugin.name][key] = method
      }
    }
  }
}

DsPlugins.prototype.get = function (name, version) {
  return new Promise((resolve, reject) => {
    let pluginId = version ? `${name}/v${version}` : name
    let scriptParams, setupOptions
    const scriptOptions = {
      id: pluginId,
      src: null
    }

    if (this.pluginMetadata[name]) {
      const metadata = this.pluginMetadata[name]

      if (version && metadata.items[version]) {
        scriptOptions.src = metadata.items[version]
      } else {
        pluginId = `${name}/v${metadata.current.version}`
        scriptOptions.src = metadata.current.src
        scriptOptions.id = pluginId

        if (metadata.urlParams) {
          scriptOptions.customParams = metadata.urlParams.names
          scriptParams = metadata.urlParams.values
        }

        if (metadata.setupOptions) {
          setupOptions = metadata.setupOptions
        }
      }
    }

    if (scriptOptions.src) {
      const script = new ScriptLoader(scriptOptions)

      script.load(scriptParams)
        .then(() => resolve({ plugin: window.pluginLoader[pluginId], options: setupOptions }))
        .catch(error => reject(error))
    } else {
      const error = new Error('plugin not found: ' + pluginId)

      reject(error)
    }
  })
}

DsPlugins.prototype.install = function (name, version) {
  return new Promise((resolve, reject) => {
    this.isLoading[name] = false

    // get plugin
    this.get(name, version)
      .then(({ plugin, setupOptions }) => {
        const dsPlugin = new DsPlugin({ isDev: this.isDev }, plugin)
        const queue = []

        if (dsPlugin.dependencies) {
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

DsPlugins.prototype.callbackWhenAvailable = function (name, callback) {
  if (this.isLoaded[name]) {
    callback()
  } else if (this.queue[name]) {
    this.isLoading(name).then(() => callback())
  } else {
    this.use({ name }).then(() => callback())
  }
}

DsPlugins.prototype.use = function ({ name, version }) {
  if (this.isLoaded[name]) {
    return Promise.resolve()
  } else if (this.queue[name]) {
    return this.isLoading(name)
  } else {
    const install = this.install(name, version)

    this.queue[name] = [install]

    return install
  }
}

export default DsPlugins
