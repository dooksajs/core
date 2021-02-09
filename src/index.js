import Plugin from './Plugin'
import PluginLoader from './pluginLoader'
const pluginLoader = new PluginLoader()

export default rules => ({
  isDev: window.location.hostname.substring(window.location.hostname.length - 9) === 'localhost',
  _methods: {},
  queue: {},
  isLoaded: {},
  isLoading (name) {
    return Promise.all(this.queue[name])
  },
  action (pluginName, fnName, params) {
    const name = pluginName + '/' + fnName

    if (this.isLoaded[pluginName]) {
      const action = this._methods[name](params)

      if (action instanceof Promise) {
        Promise.resolve(action)
          .then((result) => {
            // rules({ id: name })
          })
      } else {
        // rules({ id: name })
      }
    } else {
      this.isLoading(pluginName)
        .then(() => {
          const action = this._methods[name](params)

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
  },
  create (item) {
    return new Plugin({ isDev: this.isDev }, item)
  },
  add (item) {
    if (item.methods) {
      for (const key in item.methods) {
        if (Object.hasOwnProperty.call(item.methods, key)) {
          const method = item.methods[key]

          this._methods[`${item.name}/${key}`] = method
        }
      }
    }
  },
  setup (plugin, name) {
    const setup = plugin.setup()

    if (setup instanceof Promise) {
      this.queue[name].push(setup)

      Promise.resolve(setup)
        .then(() => {
          this.isLoaded[name] = true
        })
    } else {
      this.isLoaded[name] = true
    }
  },
  install (name, version) {
    return new Promise((resolve) => {
      if (this.isLoaded[name] || this.queue[name]) {
        resolve()
      }

      const getPlugin = pluginLoader.get(name, version)

      this.isLoaded[name] = false
      this.queue[name] = [getPlugin]

      getPlugin
        .then((result) => {
          const plugin = this.create(result)

          if (plugin.dependencies) {
            const depQueue = []

            for (let i = 0; i < plugin.dependencies.length; i++) {
              const { name, version } = plugin.dependencies[i]
              const depPlugin = this.install(name, version)

              depQueue.push(depPlugin)
            }

            Promise.all(depQueue)
              .then(() => {
                this.setup(plugin, name)
                this.add(plugin)
                this.isLoading(name).then(() => resolve())
              })
          } else {
            this.setup(plugin, name)
            this.add(plugin)
            this.isLoading(name).then(() => resolve())
          }
        })
        .catch(error => console.error(error))
    })
  }
})
