import { parseSchema } from './parseSchema.js'

/**
 * @constructor
 */
function Context (plugins = []) {
  this.plugins = []
  this.setup = []
  this.actions = {}
  this.components = {
    items: {},
    getters: {},
    setters: {},
    ignoreAttributes: []
  }
  this.data = {
    values: {},
    schema: {}
  }

  for (let i = 0; i < plugins.length; i++) {
    this.add(plugins[i])
  }
}

Context.prototype.add = function (plugin) {
  // check if plugin exists
  if (this.plugins.indexOf(plugin) !== -1) {
    const { name, setup } = plugin
    // unshift setup
    if (plugin.setup) {
      this.setup = this.setup.filter(item => item.initialize !== setup)
      this.setup.unshift({ name, initialize: setup })
    }
  }

  // store plugin
  this.plugins.push(plugin)
  const { name, actions, data, dependencies, setup, components } = plugin

  if (setup) {
    this.setup.push({
      name,
      initialize: setup
    })
  }

  if (dependencies) {
    for (let i = 0; i < dependencies.length; i++) {
      this.add(dependencies[i])
    }
  }

  // extract actions
  if (actions) {
    for (const key in actions) {
      if (Object.hasOwnProperty.call(actions, key)) {
        this.actions[name + '/' + key] = actions[key]
      }
    }
  }

  // extract data (need to parse and set default value)
  if (data) {
    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        const dataItem = data[key]
        const schemaType = dataItem.type
        let dataValue

        switch (schemaType) {
          case 'collection':
            dataValue = {}
            break
          case 'object':
            dataValue = {}
            break
          case 'array':
            dataValue = []
            break
          case 'string':
            dataValue = ''
            break
          case 'number':
            dataValue = 0
            break
          case 'boolean':
            dataValue = true
            break
        }

        // data namespace
        const collectionName = plugin.name + '/' + key
        const isCollection = schemaType === 'collection'

        this.data.values[collectionName] = dataValue
        this.data.schema[collectionName] = {
          default: dataValue,
          schema: parseSchema.process({}, collectionName, dataItem, [], true),
          isCollection
        }
      }
    }
  }

  if (components) {
    for (let i = 0; i < plugin.components.length; i++) {
      const component = plugin.components[i]
      const id = component.name

      this.components.items[id] = component
      this.components.items[id].plugin = name

      if (component.content) {
        if (component.content.get) {
          const ignoreAttributes = []
          this.components.getters[id] = component.content.get

          for (let i = 0; i < component.content.get.length; i++) {
            const getter = component.content.get[i]

            if (getter.type === 'attribute') {
              ignoreAttributes.push(getter.name)
            }
          }

          if (ignoreAttributes.length) {
            this.components.ignoreAttributes[id] = ignoreAttributes
          }
        }

        if (component.content.set) {
          this.components.setters[id] = component.content.set
        }
      }
    }
  }
}

export { Context }
