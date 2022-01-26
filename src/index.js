function Plugin (plugin, context = {}) {
  this.name = plugin.name
  this.version = plugin.version
  this._context = {}

  if (plugin.dependencies) {
    this.dependencies = plugin.dependencies
  }

  if (plugin.data) {
    this._context = { ...plugin.data }
  }

  this._context.$ds = context

  //  check if plugin whats to add hooks
  if (plugin.hooks) {
    if (!this._context.$ds._hooks) {
      this._context.$ds._hooks = {}
    }

    for (const key in plugin.hooks) {
      if (Object.hasOwnProperty.call(plugin.hooks, key)) {
        const { name, hook } = plugin.hooks[key]

        this._context.$ds._hooks[key] = {
          name: plugin.name + name.charAt(0).toUpperCase() + name.slice(1),
          hook: hook.bind(this._context)
        }
      }
    }
  }

  // check if plugin wants to use a hook
  if (this._context.$ds._hooks) {
    for (const key in this._context.$ds._hooks) {
      if (plugin[key]) {
        this._context['$' + this._context.$ds._hooks[key].name] = this._context.$ds._hooks[key].hook(plugin.name, plugin[key])
      }
    }
  }

  if (plugin.getters) {
    // Add observers to data
    const getters = {}

    for (const key in plugin.getters) {
      if (Object.hasOwnProperty.call(plugin.getters, key)) {
        const item = plugin.getters[key]
        // Add getter
        Object.defineProperty(this._context, key, { get: item })
        // Catch the public getter
        if (key.charAt(0) !== '_') {
          getters[key] = item.bind(this._context)
        }
      }
    }

    this.getters = getters
  }

  if (plugin.methods) {
    const methods = {}

    for (const key in plugin.methods) {
      if (Object.hasOwnProperty.call(plugin.methods, key)) {
        const item = plugin.methods[key]

        this._context[key] = item

        // Catch the public method
        if (key.charAt(0) !== '_') {
          methods[key] = item.bind(this._context)
        }
      }
    }

    this.methods = methods
  }

  if (plugin.setup) {
    this.setup = plugin.setup.bind(this._context)
  }
}

Plugin.prototype.init = function (params) {
  if (this.setup) {
    return this.setup(params)
  }
}

export default Plugin
