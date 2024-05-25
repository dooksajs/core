/**
 * @typedef {Object.<string, ComponentOptionItem>} ComponentOption
 */

/**
 * @typedef {Object} ComponentOptionItem
 * @property {string} attribute - Name of attribute
 * @property {boolean} [replace] - How to modify attribute
 * @property {Object.<string, (string|string[])>} [values] - Attribute values
 */

/**
 * @typedef {Object} ComponentProperty
 * @property {string} name - Name of node property
 * @property {boolean} [join] - Join value
 * @property {string} value - Node value
 */

/**
 * @typedef {Object} ComponentChild
 * @property {string} id
 * @property {ComponentProperty[]} properties
 * @property {Array<ComponentChild|string>} children
 */

/**
 * @template C
 * @template {string|function} G
 * @template {string|function} S
 * @param {Object} component
 * @param {string} component.id - Component id
 * @param {Function} [component.component] - Lazy load component
 * @param {Array<ComponentChild|string>} [component.children] - Child components
 * @param {Object} [component.allowedChildren] - Permitted nested components
 * @param {C} [component.constructor] - Constructor function to create a component instance
 * @param {string} [component.tag] - Element tag name
 * @param {Object[]} [component.content] - Define content structure
 * @param {string} component.content[].name - Name of content property
 * @param {G} component.content[].get - Getter name
 * @param {S} component.content[].set - Setter name
 * @param {ComponentProperty[]} [component.properties]
 * @param {ComponentOption} [component.options]
 * @param {ComponentOption[]} [component.extendedOptions]
 * @param {Object[]} [component.styles]
 * @param {string} component.styles[].name - Style property name
 * @param {'unit'|'box-shadow'|'font-family'|'rgba'|'units'|'number'} component.styles[].type - Style property name
 */
function createComponent (data) {
  return new Component(data)
}

/**
 * @constructor
 * @param {Object} component
 */
function Component ({
  id,
  name,
  component,
  children,
  allowedChildren,
  initialize,
  tag,
  content,
  properties = [],
  options,
  styles
}) {
  this.id = id
  this.name = name
  this.component = component
  this.children = children,
  this.allowedChildren = allowedChildren
  this.initialize = initialize
  this.tag = tag
  this.content = content
  this.properties = properties
  this.options = options
  this.styles = styles
  this.componentIsLoaded = !component
}

/**
 * Create a modified component
 * @param {Object.<string, string>} options
 * @param {ComponentChild} [children]
 */
Component.prototype.modify = function (options, children = this.children) {
  const properties = this.properties.slice()

  for (const key in options) {
    if (Object.hasOwnProperty.call(options, key)) {
      const option = this.options[key]
      const value = options[key]
      let newPropertyValue = value

      if (!option) {
        throw new Error('Component option does not exist "' + value +'"')
      }

      if (option.values) {
        if (option.values[value] == null) {
          throw new Error('Component modifier value has an unexpected value "' + value + '"')
        }

        newPropertyValue = option.values[value]
      }

      const newProperty = {
        name: option.name,
        value: newPropertyValue
      }

      let hasProperty = false

      for (let i = 0; i < properties.length; i++) {
        const property = properties[i]

        if (property.name === option.name) {
          hasProperty = true

          if (property && option.join) {
            newProperty.value = property.value + newProperty.value
          }

          properties[i] = newProperty
        }
      }

      if (!hasProperty) {
        properties.push(newProperty)
      }
    }
  }

  return {
    id: this.id,
    modifiedProperties: properties,
    create: () => {
      return this.create(null, properties, children)
    }
  }
}

Component.prototype.create = function (options, properties = this.properties, children = this.children) {
  if (options) {
    properties = this.modify(options).modifiedProperties
  }

  // lazy load web component
  if (typeof this.component === 'function' && !this.componentIsLoaded) {
    return new Promise((resolve, reject) => {
      this.component()
        .then(() => {
          const element = document.createElement(this.tag)

          this.componentIsLoaded = true

          setProperties(element, properties)
          appendChildren(element, children)

          resolve(element)
        })
        .catch(error => reject(error))
    })
  }

  let node

  // Custom element constructor
  if (typeof this.initialize === 'function') {
    node = this.initialize()
  } else {
    // create element
    node = document.createElement(this.tag)
  }

  setProperties(node, properties)
  appendChildren(node, children)

  return node
}

Component.prototype.getContent = function (node) {
  if (!this.content) {
    return
  }

  const content = {}

  for (let i = 0; i < this.content.length; i++) {
    const content = this.content[i]

    content[node.name] = node[content.get]
  }

  return content
}

Component.prototype.setContent = function (node, values) {
  if (!this.content) {
    return
  }

  for (let i = 0; i < this.content.length; i++) {
    const content = this.content[i]

    if (content.set) {
      node[content.set] = values[content.name]
    }
  }
}

function appendChildren (element, children = []) {
  if (!children.length) {
    return
  }

  const nodeList = []
  let hasPromise = false

  for (let i = 0; i < children.length; i++) {
    const childNode = children[i].create()

    if (childNode instanceof Promise) {
      hasPromise = true
    }

    nodeList.push(childNode)
  }

  if (hasPromise) {
    Promise.all(nodeList)
      .then((nodes) => {
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i]

          element.appendChild(node)
        }
      })
  } else {
    for (let i = 0; i < nodeList.length; i++) {
      const node = nodeList[i]

      element.appendChild(node)
    }
  }
}


/**
 * Set properties to element
 * @param {HTMLElement} element - view node id
 * @param {Object[]} properties
 * @private
 */
function setProperties (element, properties = []) {
  for (let i = 0; i < properties.length; i++) {
    const { name, value } = properties[i]

    if (element[name] != null) {
      element[name] = value
    } else {
      element.setAttribute(name, value)
    }
  }
}

export default createComponent
