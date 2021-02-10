import DsPlugin from './Plugin'
import ScriptLoader from '@dooksa/script-loader'
import basePlugins from './basePlugins'

function DsPlugins ({ workflow, isDev, siteId }) {
  // prepare global variable for plugin scripts
  if (!window.pluginLoader) {
    window.pluginLoader = {}
  }

  this._methods = {}
  this.isDev = isDev
  this.workflow = workflow
  this.queue = {}
  this.isLoaded = {}
  this.sitePluginsLoaded = false
  this.sitePluginsLoading = []
  this.plugins = { ...basePlugins }
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

          this.plugins = { ...this.plugins, ...doc.plugins }

          resolve()
        })
        .catch((e) => reject(e))
    })
  })
}

DsPlugins.prototype.action = function ({ pluginName, methodName, params, callback }) {
  this.callbackWhenAvailable(pluginName, () => {
    const action = this._methods[pluginName][methodName](params)

    if (action instanceof Promise) {
      Promise.resolve(action)
        .then((result) => {
          // rules({ id: name })
        })
    } else {
      // rules({ id: name })
    }
  })
}

DsPlugins.prototype.add = function (item) {
  if (item.methods) {
    this._methods[item.name] = {}

    for (const key in item.methods) {
      if (Object.hasOwnProperty.call(item.methods, key)) {
        const method = item.methods[key]

        this._methods[item.name][key] = method
      }
    }
  }
}

DsPlugins.prototype.get = function (name, version) {
  return new Promise((resolve, reject) => {
    let pluginId = version ? `${name}/v${version}` : name
    let scriptSrc

    if (this.plugins[name]) {
      if (version && this.plugins[name].items[version]) {
        scriptSrc = this.plugins[name].items[version]
      } else {
        const current = this.plugins[name].current

        scriptSrc = current.src
        pluginId = `${name}/v${current.version}`
      }
    }

    if (scriptSrc) {
      const script = new ScriptLoader({
        id: 'plugin-' + pluginId,
        src: scriptSrc
      })

      script.load()
        .then(() => resolve(window.pluginLoader[pluginId]))
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
      .then((item) => {
        const plugin = new DsPlugin({ isDev: this.isDev }, item)
        const queue = []

        if (plugin.dependencies) {
          const depQueue = []

          for (let i = 0; i < plugin.dependencies.length; i++) {
            const { name, version } = plugin.dependencies[i]
            const depPlugin = this.use({ name, version })

            depQueue.push(depPlugin)
          }

          // wait for all dependencies to load
          Promise.all(depQueue)
            .then(() => {
              const setup = this.setup(plugin)

              if (setup) {
                queue.push(setup)
              }

              // wait for plugin to setup
              Promise.all(queue)
                .then(() => {
                  this.add(plugin)
                  this.isLoaded[name] = true
                  resolve()
                })
                .catch(e => reject(e))
            })
            .catch(e => reject(e))
        } else {
          const setup = this.setup(plugin)

          if (setup) {
            queue.push(setup)
          }

          // wait for plugin to setup
          Promise.all(queue)
            .then(() => {
              this.add(plugin)
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

DsPlugins.prototype.setup = function (plugin, options) {
  const setup = plugin.setup(options)

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

DsPlugins.prototype.use = function ({ name, version, options }) {
  if (this.isLoaded[name]) {
    return Promise.resolve()
  } else if (this.queue[name]) {
    return this.isLoading(name)
  } else {
    const install = this.install(name, version, options)

    this.queue[name] = [install]

    return install
  }
}

export default DsPlugins
