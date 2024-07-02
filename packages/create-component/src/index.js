import { componentOptions, createComponent, extendComponent } from './component.js'
import createMixin from './mixin.js'

/**
 * @typedef {'sm'|'md'|'lg'|'always'} BreakpointAlwaysLg
 * @typedef {'sm'|'md'|'lg'|'xl'|'xxl'} BreakpointSmXXL
 * @typedef {'sm'|'md'|'lg'|'xl'|'xxl'|'always'} BreakpointAlwaysXXL
 * @typedef {'10'|'25'|'50'|'75'} Opacity
 * @typedef {'0'|'1'|'2'|'3'|'4'|'5'} Spacer
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
 * 'white'} ColorExtra
 * @typedef {'primary'|
 * 'secondary'|
 * 'success'|
 * 'danger'|
 * 'warning'|
 * 'info'|
 * 'light'|
 * 'dark'} Color
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
 * @typedef {ComponentDataValues & ComponentData & ComponentMetadata} Component
 */

/**
 * @typedef {Object} ComponentMetadata
 * @property {'link'|'section'|'img'|'input'|'element'} [type]
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
 * @property {boolean} [toggle] - toggle property value
 * @property {Object.<string, (string|boolean)>} [values] - Attribute values
 * @property {string|boolean} [value] - Attribute value
 * @property {Function} [computedValue]
 */

/**
 * @typedef {Object} ComponentProperty
 * @property {string} name - Name of node property
 * @property {boolean} [replace] - Join value
 * @property {boolean} [toggle] - toggle property value
 * @property {string|boolean} value - Node value
 */

/**
 * @typedef {Object} ComponentInstance
 * @property {string} id - Component instance Id
 * @property {'link'|'section'|'img'|'input'|'element'} [type]
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
 * @property {'link'|'section'|'img'|'input'|'element'} [type]
 * @property {Array<Component|ComponentInstance|string>} [children] - Child components
 * @property {Array<Component|ComponentInstance|string>} [allowedChildren] - Permitted nested components
 * @property {Object[]} [content] - Define content structure
 * @property {string} content[].name - Name of content property
 * @property {string} content[].nodePropertyName - Property name
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

export {
  componentOptions,
  createComponent,
  createMixin,
  extendComponent
}
