function Plugin (plugin, context) {
  this.name = plugin.name
  this.version = plugin.version
  this._context = {}

  if (plugin.data) {
    this._context = { ...plugin.data }
  }

  if (context) {
    for (const key in context) {
      if (Object.hasOwnProperty.call(context, key)) {
        const item = context[key]
        const pluginMetadata = {
          name: plugin.name,
          version: plugin.version,
          dependencies: plugin.dependencies
        }

        if (item.type === 'value') {
          this._context[key] = item.value
        } else if (item.type === 'action') {
          this._context[key] = item.value(pluginMetadata)
        }
      }
    }
  }

  if (plugin.dependencies) {
    this.dependencies = plugin.dependencies
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
