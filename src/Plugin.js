import ScriptLoader from '@dooksa/script-loader'

export default function Plugin ({ isDev }, createPlugin) {
  const plugin = createPlugin({ ScriptLoader, isDev })

  this.name = plugin.name
  this._context = {
    name: plugin.name
  }

  if (plugin.dependencies) {
    this.dependencies = plugin.dependencies
  }

  if (plugin.data) {
    this._context = { ...this._context, ...plugin.data }
  }

  if (plugin.setup) {
    const setup = plugin.setup.bind(this._context)
    this.setup = setup
  }

  if (plugin.methods) {
    const methods = {}

    for (const key in plugin.methods) {
      if (Object.hasOwnProperty.call(plugin.methods, key)) {
        const method = plugin.methods[key]
        this._context[key] = method

        // Catch all the "_private" methods following the common js "_private" method naming convention
        if (key.charAt(0) !== '_') {
          methods[key] = method.bind(this._context)
        }
      }
    }

    this.methods = methods
  }
}

Plugin.prototype.action = function (name, params) {
  try {
    if (this._methods[name]) {
      return this._methods[name](params)
    } else {
      throw new Error('Method not found')
    }
  } catch (e) {
    console.error(`${name} failed: `, e.message)
  }
}

Plugin.prototype.setup = function () {
  if (this._setup) {
    return this._setup()
  }
}
