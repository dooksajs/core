/**
 * @import {ComponentData, ComponentDataValues, ComponentMixinMetadata, Component, ComponentOption, ComponentProperty, ComponentExtend} from './types.js
 */

/**
 * Create Dooksa component
 * @param {ComponentData & ComponentDataValues} data - Data for the component.
 * @param {Object[]} [mixins] - Optional mixins to extend the component with.
 * @param {ComponentMixinMetadata} mixins[].metadata - Metadata for the mixin.
 * @param {ComponentDataValues} mixins[].data - Data for the mixin.
 * @returns {Component} The created component object.
 * @example
 * const inputCheckbox = createComponent({
 *   id: 'input-checkbox',
 *   tag: 'input',
 *   properties: [
 *     {
 *       name: 'type',
 *       value: 'checkbox'
 *     }
 *   ]
 * })
 */
function createComponent (data, mixins = []) {
  /**
  * @type {Component}
  */
  const result = {}

  if (mixins.length) {
    result.mixins = []

    for (let i = 0; i < mixins.length; i++) {
      const { metadata, data } = mixins[i]

      result.mixins.push(metadata)

      // merge mixin
      if (data.options) {
        const options = result.options || {}

        mergeProperties(options, data.options)

        result.options = options
      }

      if (data.styles) {
        const styles = result.styles || []

        result.styles = styles.concat(data.styles)
      }

      if (data.events) {
        const events = result.events || []

        result.events = events.concat(data.events)
      }

      if (data.eventTypes) {
        const eventTypes = result.eventTypes || {}

        result.eventTypes = Object.assign(eventTypes, data.eventTypes)
      }
    }
  }

  // merge component
  mergeProperties(result, data)

  result.isLoaded = !(typeof data.component === 'function')
  result.type = result.type || 'element'

  return result
}

/**
 * In-place merge properties from components.
 * @param {Component} target - The target component to receive the merged properties
 * @param {Component & ComponentDataValues} source - The component containing the properties to merge.
 */
function mergeProperties (target, source) {
  for (const key in source) {
    if (Object.hasOwnProperty.call(source, key)) {
      const t = target[key]
      const s = source[key]

      if (t) {
        if (Array.isArray(t)) {
          target[key] = t.concat(s)
        } else {
          target[key] = Object.assign(t, s)
        }
      } else {
        target[key] = s
      }
    }
  }
}

/**
 * Convert component options to properties.
 * @param {ComponentOption} options - Component options object.
 * @param {ComponentOption} templateOptions - Template options for the component.
 * @param {ComponentProperty[]} properties - Existing list of component properties.
 * @returns {ComponentProperty[]} Updated list of component properties.
 */
function componentOptions (options, templateOptions, properties = []) {
  let replacedPropertyValue = ''
  properties = properties.slice()

  for (const key in options) {
    if (Object.hasOwnProperty.call(options, key)) {
      const templateOption = templateOptions[key]
      const propertyName = templateOption.name

      // Check if property value has already been replaced
      if (replacedPropertyValue === propertyName) {
        continue
      }

      const item = options[key]
      let newPropertyValue = item

      if (!templateOption) {
        throw new Error('Component option does not exist "' + item +'"')
      }

      if (templateOption.value) {
        const newValue = templateOption.value

        if (newValue == null) {
          throw new Error('Component modifier value has an unexpected value "' + item + '"')
        }

        newPropertyValue = newValue
      } else if (templateOption.values) {
        const newValue = templateOption.values[item]

        if (newValue == null) {
          throw new Error('Component modifier value has an unexpected value "' + item + '"')
        }

        newPropertyValue = newValue
      } else if (templateOption.computedValue) {
        const computeValue = templateOption.computedValue

        if (typeof computeValue !== 'function') {
          throw new Error('Component modifier value has an unexpected value "' + item + '"')
        }

        newPropertyValue = computeValue(item)
      }

      /** @type {ComponentProperty} */
      const newProperty = {
        name: propertyName,
        value: newPropertyValue
      }

      let hasProperty = false

      for (let i = 0; i < properties.length; i++) {
        const property = properties[i]

        if (property.name === propertyName) {
          hasProperty = true

          if (templateOption.replace) {
            replacedPropertyValue = propertyName
            newProperty.value = newPropertyValue
          } else if (templateOption.toggle) {
            // remove value
            if (!item) {
              newProperty.value = property.value.replace(newProperty.value, '')
            }
          } else if (typeof newProperty.value === 'string') {
            let value = property.value

            // prepare to append new value separated by space
            if (value) {
              value = value + ' '
            }

            newProperty.value = value + newProperty.value
          }

          properties[i] = newProperty
          break
        }
      }

      if (!hasProperty) {
        properties.push(newProperty)
      }
    }
  }

  return properties
}

/**
 * Extend a component with additional data and options.
 * @param {Component} component - Base component object to extend.
 * @param {ComponentExtend} extend - Configuration for extending the component.
 * @returns {Component} The extended component object.
 */
function extendComponent (component, extend) {
  const result = Object.assign({}, component)
  let properties = component.properties || []

  if (extend.properties) {
    properties = properties.concat(extend.properties)
  }

  if (extend.metadata) {
    result.id = extend.metadata.id
    result.parentId = component.id
  }

  if (extend.options) {
    properties = componentOptions(extend.options, component.options, component.properties)
  }

  // append properties
  if (properties.length) {
    result.properties = properties
  }

  if (extend.events) {
    if (extend.clearDefaultEvents) {
      result.events = extend.events
    } else if (result.events) {
      result.events = result.events.concat(extend.events)
    } else {
      result.events = extend.events
    }
  }

  const componentChildren = extend.children || component.children

  if (componentChildren) {
    result.children = componentChildren
  }

  return result
}

export {
  componentOptions,
  extendComponent,
  createComponent
}
