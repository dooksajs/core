/**
 * @typedef {import('./index.js').ComponentData} ComponentData
 * @typedef {import('./index.js').ComponentDataValues} ComponentDataValues
 * @typedef {import('./index.js').ComponentMixinMetadata} ComponentMixinMetadata
 * @typedef {import('./index.js').Component} Component
 * @typedef {import('./index.js').ComponentOption} ComponentOption
 * @typedef {import('./index.js').ComponentProperty} ComponentProperty
 * @typedef {import('./index.js').ComponentExtend} ComponentExtend
 */

/**
* @param {ComponentData & ComponentDataValues} data
* @param {Object[]} [mixins]
* @param {ComponentMixinMetadata} mixins[].metadata
* @param {ComponentDataValues} mixins[].data
* @returns {Component}
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

  return target
}

/**
 * Convert component options to properties
 * @param {ComponentOption} options
 * @param {ComponentOption} templateOptions
 * @param {ComponentProperty[]} properties
 * @returns {ComponentProperty[]}
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
            properties[i] = newProperty
            break
          } else if (templateOption.toggle) {
            // remove value
            if (!item) {
              newProperty.value = property.value.replace(newProperty.value, '')
              properties[i] = newProperty
              break
            }
          }

          let value = property.value

          // prepare to append new value separated by space
          if (value) {
            value = value + ' '
          }

          newProperty.value = value + newProperty.value

          properties[i] = newProperty
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
* Create a modified component
* @param {Component} component
* @param {ComponentExtend} extend
*/
function extendComponent (component, { metadata, options, children, events, extendEvents }) {
  const result = Object.assign({}, component)
  let properties = component.properties

  if (metadata) {
    result.id = metadata.id
    result.parentId = component.id
  }

  if (options) {
    properties = componentOptions(options, component.options, component.properties)
  }

  if (properties) {
    result.properties = properties
  }

  if (events) {
    if (extendEvents) {
      result.events = result.events.concat(events)
    } else {
      result.events = events
    }
  }

  const componentChildren = children || component.children

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
