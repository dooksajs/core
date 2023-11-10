import dsSchema from './utils/schema.js'

const schemaDefaults = {
  collection: Object,
  array: Array,
  number: Number,
  boolean: Boolean,
  string: String,
  object: Object,
  function: Function
}

/**
 * Plugins are used to extend and customise the Dooksa application builder.
 * @constructor
 * @param {DsPlugin} plugin - The plugin object used by the Plugin constructor.
 */
function DsPlugin (plugin) {
  this._context = {
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
        const schema = item.schema || {}
        let defaultValues

        if (typeof item.default === 'function') {
          defaultValues = item.default()
        } else if (schema.type && schemaDefaults[schema.type]) {
          defaultValues = schemaDefaults[schema.type]()
        } else {
          throw new Error('Plugin data could not be created')
        }

        if (item.private) {
          this._context[key] = defaultValues
        } else {
          const dataEntry = {}

          dataEntry.id = plugin.name + '/' + key
          dataEntry.default = defaultValues
          dataEntry.schema = dsSchema.process(this._context, dataEntry.id, schema, [], true)
          dataEntry.collection = schema.type === 'collection'

          data.push(dataEntry)
        }
      }
    }

    if (data.length) {
      this.data = data
    }
  }

  // set dependencies
  if (plugin.dependencies) {
    this.dependencies = plugin.dependencies
    this._context.dependencies = plugin.dependencies
  }

  // set methods
  if (plugin.methods) {
    const methods = {}
    const contextMethods = []

    for (const key in plugin.methods) {
      if (Object.hasOwn(plugin.methods, key)) {
        const item = plugin.methods[key]

        if (typeof item !== 'function' && typeof item !== 'object') {
          throw new Error('[' + plugin.name + '] Plugin method "' + key + '" is undefined')
        }

        const firstChar = key.charAt(0)

        // Add method to context
        this._context[key] = item

        // catch global methods
        if (firstChar === '$') {
          const method = item.value ? item.value.bind(this._context) : item.bind(this._context)
          contextMethods.push({
            name: key,
            value: method,
            scope: item.scope || false,
            export: !!item.export
          })

          methods[key] = method
          this._context[key] = method
        } else if (firstChar !== '_') {
          methods[key] = item.bind(this._context)
        }
      }
    }

    this.methods = methods

    if (contextMethods.length) {
      this.contextMethods = contextMethods
    }
  }

  // set tokens
  if (plugin.tokens) {
    const tokens = {}

    for (const key in plugin.tokens) {
      if (Object.hasOwn(plugin.tokens, key)) {
        const item = plugin.tokens[key]

        this._context[key] = item
        tokens[key] = item

        if (item.get) {
          tokens[key].get = item.get.bind(this._context)
        } else {
          tokens[key] = item.bind(this._context)
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
    this.setup = plugin.setup.bind(this._context)
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

/**
 * @param {Object[]} context - Context is shared data between plugins.
 * @param {string} context.name - The name will be the key used within the plugin, e.g. '$action' = this.$action
 * @param {(string|object)} context.value - The value of the context.
 */
DsPlugin.prototype.setContext = function (context) {
  // set context to plugin
  for (let i = 0; i < context.length; i++) {
    const item = context[i]

    // Ignore existing context
    if (this._context[item.name]) {
      continue
    }

    // ISSUE: [DS-752] applying context to plugins should be more dynamic
    if (item.scope && item.scope.includes(this.name)) {
      this._context[item.name] = item.value
    } else {
      this._context[item.name] = item.value
    }
  }
}

export default DsPlugin
