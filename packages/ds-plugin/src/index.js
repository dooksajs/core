import dsSchema from './utils/schema.js'

/**
 * Plugins are used to extend and customise the Dooksa application builder.
 * @interface
 * @param {DsPlugin} plugin - The plugin object used by the Plugin constructor.
 * @param {Object[]} context - Context is shared data between plugins.
 * @param {string} context.name - The name will be the key used within the plugin, e.g. '$action' = this.$action
 * @param {(string|object)} context.value - The value of the context.
 * @param {Boolean} isDev - Sets development features
 */
function DsPlugin (plugin, context = [], isDev) {
  let _context = {
    name: plugin.name,
    version: plugin.version
  }

  this.name = plugin.name
  this.version = plugin.version

  // set data to context
  if (plugin.data) {
    const data = []

    // process data
    for (const key in plugin.data) {
      if (Object.hasOwn(plugin.data, key)) {
        const item = plugin.data[key]

        if (item.private) {
          _context[key] = item.default
        } else {
          const dataEntry = {}
          const item = plugin.data[key]
          const schema = item.schema

          dataEntry.id = plugin.name + '/' + key
          dataEntry.default = item.default
          dataEntry.schema = dsSchema.process(_context, dataEntry.id, schema, [], true)
          dataEntry.collection = schema.type === 'collection'

          data.push(dataEntry)
        }
      }
    }

    if (data.length) {
      this.data = data
    }
  }

  // set context to plugin
  for (let i = 0; i < context.length; i++) {
    const item = context[i]
    // ISSUE: [DS-752] applying context to plugins should be more dynamic
    if (item.scope && item.scope.includes(plugin.name)) {
      _context[item.name] = item.value
    }

    if (item.name === 'isDev' && item.value) {
      // _context.isDev = true

      // if (plugin.name !== 'dsDevTool') {
      //   _context.$action('dsDevTool/set', { _context, plugin })
      // }
    } else {
      _context[item.name] = item.value
    }
  }

  // set dependencies
  if (plugin.dependencies) {
    this.dependencies = plugin.dependencies
    _context.dependencies = plugin.dependencies
  }

  // set methods
  if (plugin.methods) {
    const methods = {}
    const contextMethods = {}

    for (const key in plugin.methods) {
      if (Object.hasOwn(plugin.methods, key)) {
        const item = plugin.methods[key]
        // Add method
        _context[key] = item
        const firstChar = key.charAt(0)

        // catch global methods
        if (firstChar === '$') {
          contextMethods[key] = item.bind(_context)

          continue
        }

        // Catch the public method
        if (firstChar !== '_') {
          methods[key] = item.bind(_context)
        }
      }
    }

    this.methods = methods
    this.contextMethods = contextMethods
  }

  // set tokens
  if (plugin.tokens) {
    const tokens = {}

    for (const key in plugin.tokens) {
      if (Object.hasOwn(plugin.tokens, key)) {
        const item = plugin.tokens[key]

        _context[key] = item
        tokens[key] = item

        if (item.get) {
          tokens[key].get = item.get.bind(_context)
        } else {
          tokens[key] = item.bind(_context)
        }
      }
    }

    this.tokens = tokens
  }
  // set components
  if (plugin.components) {
    for (let i = 0; i < plugin.components.length; i++) {
      const component = plugin.components[i]
      // check if component is lazy loaded
      if (component.lazy) {
        component.isLazy = true
      }
    }

    this.components = plugin.components
  }

  // set setup function
  if (plugin.setup) {
    this.setup = plugin.setup.bind(_context)
  }
}

/**
 * Runs the setup function within the plugin if present, this function is intended to be used by the parent plugin
 * @param {Object.<(number|boolean|string|array|object)>} params - These are the parameters required by the setup function
 * @returns {(number|boolean|string|array|object)}
 */
DsPlugin.prototype.init = function (params) {
  if (this.setup) {
    return this.setup(params)
  }
}

export default DsPlugin
