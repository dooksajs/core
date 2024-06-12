import { objectHash } from '@dooksa/utils'

/**
 * @typedef {ComponentDataValues & ComponentData & ComponentMetadata} Component
 */

/**
 * @typedef {Object} ComponentMetadata
 * @property {string} [hash] - Component hash
 * @property {Function} [component] - Lazy load component
 * @property {boolean} [isLoaded] - Marks if web component is loaded
 * @property {string} [parentId] - Parent template Id if component was extended
 * @property {ComponentMixinMetadata[]} [mixins]
 */

/**
 * @typedef {Object.<string, (Object.<string,ComponentOptionItem>|ComponentOptionItem)>} ComponentOption
 */

/**
 * @typedef {Object} ComponentOptionItem
 * @property {string} name - Name of attribute/setter
 * @property {boolean} [replace] - Replace property value
 * @property {Object.<string, string>} [values] - Attribute values
 * @property {string} [value] - Attribute value
 * @property {Function} [computedValue]
 */

/**
 * @typedef {Object} ComponentProperty
 * @property {string} name - Name of node property
 * @property {boolean} [join] - Join value
 * @property {string} value - Node value
 */

/**
 * @typedef {Object} ComponentInstance
 * @property {string} id - Component instance Id
 * @property {string} [parentId] - The parent component Id if instance was extended
 * @property {string} hash - Hash of parent component
 * @property {Array<Component|ComponentInstance|string>} [children]
 * @property {ComponentEvent[]} [events]
 * @property {ComponentProperty[]} [properties]
 */

/**
 * @typedef {Object} ComponentMixinMetadata
 * @property {string} id
 * @property {string} [hash]
 */

/**
 * @typedef {Object} ComponentEvent
 * @property {string} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ComponentDataValues
 * @property {Array<Component|ComponentInstance|string>} [children] - Child components
 * @property {Array<Component|ComponentInstance|string>} [allowedChildren] - Permitted nested components
 * @property {Object[]} [content] - Define content structure
 * @property {string} content[].name - Name of content property
 * @property {string} content[].propertyName - Property name
 * @property {ComponentEvent[]} [events]
 * @property {Object.<string, boolean>} [eventTypes]
 * @property {ComponentProperty[]} [properties]
 * @property {ComponentOption} [options]
 * @property {Object[]} [styles]
 * @property {string} styles[].name - Style property name
 * @property {'unit'|'box-shadow'|'font-family'|'rgba'|'units'|'number'} styles[].type - Style property name
 */

/**
 * @typedef {Object} ComponentData
 * @property {string} id - Component id
 * @property {Function} [component] - Lazy load component
 * @property {Function} [initialize] - Constructor function to create a component instance
 * @property {string} [tag] - Element tag name
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

  const hash = objectHash(result)

  result.hash = hash

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
 * @param {Object} mixin
 * @param {ComponentMixinMetadata} mixin.metadata
 * @param {ComponentDataValues} mixin.data
 */
function createMixin (mixin) {
  const result = mixin

  const hash = objectHash(result)

  result.metadata.hash = hash

  return result
}

/** @typedef {'sm'|'md'|'lg'|'always'} BreakpointAlwaysLg */
/** @typedef {'sm'|'md'|'lg'|'xl'|'xxl'} BreakpointSmXXL */
/** @typedef {'sm'|'md'|'lg'|'xl'|'xxl'|'always'} BreakpointAlwaysXXL */
/** @typedef {'10'|'25'|'50'|'75'} Opacity */
/** @typedef {'0'|'1'|'2'|'3'|'4'|'5'} Spacer */
/**
 * @typedef {'primary'|
 * 'primarySubtle'|
 * 'secondary'|
 * 'secondarySubtle'|
 * 'success'|
 * 'successSubtle'|
 * 'danger'|
 * 'dangerSubtle'|
 * 'warning'|
 * 'warningSubtle'|
 * 'info'|
 * 'infoSubtle'|
 * 'light'|
 * 'lightSubtle'|
 * 'dark'|
 * 'darkSubtle'|
 * 'body'|
 * 'bodySecondary'|
 * 'bodyTertiary'|
 * 'black'|
 * 'white'} Color
 */

/**
 * Create a modified component
 * @typedef {Object} ComponentExtend
 * @property {ComponentMixinMetadata} [metadata]
 * @property {ComponentEvent[]} [events]
 * @property {Object} [options]
 * @property {Array<Component|ComponentInstance>} [children]
 */

/**
 * Create a modified component
 * @param {Component} component
 * @param {ComponentExtend} extend
 */
function extendComponent (component, { metadata, options, children, events }) {
  const properties = component.properties ? component.properties.slice() : []
  const result = Object.assign({}, component)

  result.properties = properties

  if (metadata) {
    result.id = metadata.id
    result.parentId = component.id
  }

  if (options) {
    let replacedPropertyValue = ''

    for (const key in options) {
      if (Object.hasOwnProperty.call(options, key)) {
        const componentOption = component.options[key]
        const propertyName = componentOption.name

        if (replacedPropertyValue === propertyName) {
          continue
        }

        const item = options[key]
        let newPropertyValue = item

        if (!componentOption) {
          throw new Error('Component option does not exist "' + item +'"')
        }

        if (componentOption.value) {
          const newValue = componentOption.value

          if (newValue == null) {
            throw new Error('Component modifier value has an unexpected value "' + item + '"')
          }

          newPropertyValue = newValue
        }

        if (componentOption.values) {
          const newValue = componentOption.values[item]

          if (newValue == null) {
            throw new Error('Component modifier value has an unexpected value "' + item + '"')
          }

          newPropertyValue = newValue
        }

        if (componentOption.computedValue) {
          const computeValue = componentOption.computedValue

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

            if (property && componentOption.replace) {
              replacedPropertyValue = propertyName
              newProperty.value = newPropertyValue
              properties[i] = newProperty
              break
            }

            newProperty.value = property.value + ' ' + newProperty.value

            properties[i] = newProperty
          }
        }

        if (!hasProperty) {
          properties.push(newProperty)
        }
      }
    }
  }


  if (events) {
    result.events = events
  }

  const componentChildren = children || component.children

  if (componentChildren) {
    result.children = componentChildren
  }

  return result
}

export {
  extendComponent,
  createComponent,
  createMixin
}

export default createComponent
