/**
 * @classdesc Plugins are used to extend and customise the Dooksa application builder.
 * @class
 * @param {Object} plugin - The plugin object used by the Plugin constructor.
 * @param {string} plugin.name - The name of the plugin.
 * @param {number} plugin.version - The version of the plugin.
 * @param {Object[]} plugin.dependencies - List of dependent plugins, e.g. if this plugin x used y by running an action: x.$action('y', params).
 * @param {string} plugin.dependencies[].name - The name of the dependent plugin.
 * @param {number} plugin.dependencies[].version - The version of the dependent plugin.
 * @param {Object} plugin.setup - This .
 * @param {Object.<string, (number|boolean|string|array|object)>} plugin.data - The object that contains plugins data.
 * @param {Object.<string, object>} plugin.methods - The version of the plugin.
 * @param {Object[]} context - Context is shared data between plugins.
 * @param {string} context.name - The name will be the key used within the plugin, e.g. '$action' = this.$action
 * @param {number} context.dispatch - If true the context.value (function) return value will be used.
 * @param {(string|object)} context.value - The value of the context.
 */
function Plugin (plugin, context = []) {
  let _context = {
    name: plugin.name,
    version: plugin.version
  }

  this.name = plugin.name
  this.version = plugin.version

  // set data to context
  if (plugin.data) {
    _context = { ..._context, ...plugin.data }
  }
  // set context to plugin
  for (let i = 0; i < context.length; i++) {
    const item = context[i]
    const pluginMetadata = {
      name: plugin.name,
      version: plugin.version,
      dependencies: plugin.dependencies
    }

    if (item.dispatch) {
      _context[item.name] = item.value(pluginMetadata)
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

    for (const key in plugin.methods) {
      if (Object.hasOwnProperty.call(plugin.methods, key)) {
        const item = plugin.methods[key]
        // Add method
        _context[key] = item
        // Catch the public method
        if (key.charAt(0) !== '_') {
          methods[key] = item.bind(_context)
        }
      }
    }

    this.methods = methods
  }
  // set setup function
  if (plugin.setup) {
    this.setup = plugin.setup.bind(_context)
  }
}

/**
 * Runs the setup function within the plugin if present, this function is intended to be used by the parent plugin
 * @param {Object, <string, (number|boolean|string|array|object)>} params - These are the parameters required by the setup function
 * @returns {(number|boolean|string|array|object)}
 */
Plugin.prototype.init = function (params) {
  if (this.setup) {
    return this.setup(params)
  }
}

export default Plugin
