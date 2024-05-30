import { objectHash } from '@dooksa/utils'

/**
 * @typedef {Object} Component
 * @property {string} id - Component id
 * @property {string} [hash] - Component hash
 * @property {Function} [component] - Lazy load component
 * @property {boolean} [isLoaded] - Marks if web component is loaded
 * @property {Array<Component|ComponentInstance|string>} [children] - Child components
 * @property {Array<Component|ComponentInstance|string>} [allowedChildren] - Permitted nested components
 * @property {Function} [initialize] - Constructor function to create a component instance
 * @property {string} [tag] - Element tag name
 * @property {Object[]} [content] - Define content structure
 * @property {string} content[].name - Name of content property
 * @property {string} content[].get - Getter name
 * @property {string} content[].set - Setter name
 * @property {ComponentProperty[]} [properties]
 * @property {ComponentOption} [options]
 * @property {ComponentOption[]} [extendedOptions]
 * @property {Object[]} [styles]
 * @property {string} styles[].name - Style property name
 * @property {'unit'|'box-shadow'|'font-family'|'rgba'|'units'|'number'} styles[].type - Style property name
 */

/**
 * @typedef {Object.<string, (Object.<string,ComponentOptionItem>|ComponentOptionItem)>} ComponentOption
 */

/**
 * @typedef {Object} ComponentOptionItem
 * @property {string} name - Name of attribute/setter
 * @property {boolean} [join] - Join option value with existing component value
 * @property {Object.<string, string>} [values] - Attribute values
 * @property {string} [value] - Attribute value
 */

/**
 * @typedef {Object} ComponentProperty
 * @property {string} name - Name of node property
 * @property {boolean} [join] - Join value
 * @property {string} value - Node value
 */

/**
 * @typedef {Object} ComponentInstance
 * @property {string} id
 * @property {string} hash
 * @property {ComponentProperty[]} [properties]
 * @property {Array<Component|ComponentInstance|string>} [children]
 */

/**
 * @param {Object} data
 * @param {string} data.id - Component id
 * @param {Function} [data.component] - Lazy load component
 * @param {Array<Component|ComponentInstance|string>} [data.children] - Child components
 * @param {Array<Component|ComponentInstance|string>} [data.allowedChildren] - Permitted nested components
 * @param {Function} [data.initialize] - Constructor function to create a component instance
 * @param {string} [data.tag] - Element tag name
 * @param {Object[]} [data.content] - Define content structure
 * @param {string} data.content[].name - Name of content property
 * @param {string} data.content[].get - Getter name
 * @param {string} data.content[].set - Setter name
 * @param {ComponentProperty[]} [data.properties]
 * @param {ComponentOption} [data.options]
 * @param {ComponentOption[]} [data.extendedOptions]
 * @param {Object[]} [data.styles]
 * @param {string} data.styles[].name - Style property name
 * @param {'unit'|'box-shadow'|'font-family'|'rgba'|'units'|'number'} data.styles[].type - Style property name
 * @returns {Component}
 */
function createComponent (data) {
  /**
   * @type {Component}
   */
  const result = data

  result.isLoaded = !(typeof data.component === 'function')
  result.hash = objectHash(result)

  return result
}

/**
 * Create a modified component
 * @param {Component} component
 * @param {Object.<string, string>} options
 * @returns {ComponentInstance}
 */
function modifyComponent (component, options) {
  const properties = component.properties ? component.properties.slice() : []

  for (const key in options) {
    if (Object.hasOwnProperty.call(options, key)) {
      const componentOption = component.options[key]
      const value = options[key]
      let newPropertyValue = value

      if (!componentOption) {
        throw new Error('Component option does not exist "' + value +'"')
      }

      if (componentOption.values) {
        if (componentOption.values[value] == null) {
          throw new Error('Component modifier value has an unexpected value "' + value + '"')
        }

        newPropertyValue = componentOption.values[value]
      }

      /**
       * @type {ComponentProperty}
       */
      const newProperty = {
        name: componentOption.name,
        value: newPropertyValue
      }

      let hasProperty = false

      for (let i = 0; i < properties.length; i++) {
        const property = properties[i]

        if (property.name === componentOption.name) {
          hasProperty = true

          if (property && componentOption.join) {
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

  if (component.children) {
    return {
      id: component.id,
      hash: component.hash,
      properties,
      children: component.children
    }
  }

  return {
    id: component.id,
    hash: component.hash,
    properties
  }
}

export {
  modifyComponent,
  createComponent
}

export default createComponent
