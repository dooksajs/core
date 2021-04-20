export default function Plugin (context, plugin) {
  this.name = plugin.name
  this.version = plugin.version
  this._context = {
    $context: context
  }

  if (plugin.dependencies) {
    this.dependencies = plugin.dependencies
  }

  if (plugin.data) {
    this._context = { ...this._context, ...plugin.data }
  }

  if (plugin.setup) {
    this.setup = plugin.setup.bind(this._context)
  }

  if (plugin.getters) {
    const getters = {}

    for (const key in plugin.getters) {
      if (Object.hasOwnProperty.call(plugin.getters, key)) {
        let item = plugin.getters[key]
        this._context[key] = item

        if (typeof item === 'function') {
          item = item.bind(this._context)
        }

        getters[key] = item
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

        // Catch all the "_private" methods following the common js "_private" method naming convention
        if (key.charAt(0) !== '_') {
          methods[key] = item.bind(this._context)
        }
      }
    }

    this.methods = methods
  }
}

Plugin.prototype.setup = function () {
  if (this._setup) {
    return this._setup()
  }
}
