import Plugin from './Plugin'
import pluginLoader from './pluginLoader'

export default rules => ({
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
    return new Plugin(item)
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
  fetch (plugin, name) {
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
  setup (name, version) {
    return new Promise((resolve) => {
      if (this.isLoaded[name] || this.queue[name]) {
        resolve()
      }

      const pluginItem = pluginLoader(name, version)

      this.isLoaded[name] = false
      this.queue[name] = []

      // remove async key, move plugin getter into pluginLoader
      if (!pluginItem.get) {
        const plugin = this.create(pluginItem.current)

        if (plugin.dependencies) {
          const depQueue = []

          for (let i = 0; i < plugin.dependencies.length; i++) {
            const { name, version } = plugin.dependencies[i]
            const depPlugin = this.setup(name, version)

            depQueue.push(depPlugin)
          }

          Promise.all(depQueue)
            .then(() => {
              this.fetch(plugin, name)
              this.add(plugin)
              this.isLoading(name).then(() => resolve())
            })
        } else {
          this.fetch(plugin, name)
          this.add(plugin)
          this.isLoading(name).then(() => resolve())
        }
      } else {
        const getPlugin = new Promise((resolve, reject) => {
          pluginItem.getPlugin()
            .then((result) => {
              const plugin = this.create(result.current)
              const pluginSetup = this.fetch(plugin, name)

              this.add(plugin)
              this.queue[name].push(pluginSetup)
              resolve()
            })
        })

        this.queue[name].push(getPlugin)
      }
    })
  }
})
