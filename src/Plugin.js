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
    this.setup = plugin.setup.bind(this._context)
  }

  if (plugin.getters) {
    const getters = {}

    for (const key in plugin.getters) {
      if (Object.hasOwnProperty.call(plugin.getters, key)) {
        const item = plugin.getters[key]

        this._context[key] = item
        getters[key] = item.bind(this._context)
      }
    }

    this.getters = getters
  }

  if (plugin.methods) {
    const methods = {}
    const commits = {}

    for (const mKey in plugin.methods) {
      if (Object.hasOwnProperty.call(plugin.methods, mKey)) {
        let item = plugin.methods[mKey]

        if (item.method) {
          if (item.commit) {
            for (const cKey in item.commit) {
              if (Object.hasOwnProperty.call(item.commit, cKey)) {
                const commit = item.commit[cKey]

                // TODO: [DS-321] commits might need to be bound to "this._context"
                commits[`${mKey}/${cKey}`] = commit
              }
            }
          }

          item = item.method
        }

        this._context[mKey] = item

        // Catch all the "_private" methods following the common js "_private" method naming convention
        if (mKey.charAt(0) !== '_') {
          methods[mKey] = item.bind(this._context)
        }
      }
    }

    this.commits = commits
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
