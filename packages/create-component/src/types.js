/**
 * @typedef {'none'|'sm'|'md'|'lg'} BreakpointNoneLg - A breakpoint with values for none, small, medium, and large.
 * @typedef {'sm'|'md'|'lg'|'always'} BreakpointAlwaysLg - A breakpoint with values for small, medium, large, and always.
 * @typedef {'sm'|'md'|'lg'|'xl'|'xxl'} BreakpointSmXXL - A breakpoint with values for small, medium, large, extra-large, and extra-extra-large.
 * @typedef {'sm'|'md'|'lg'|'xl'|'xxl'|'always'} BreakpointAlwaysXXL - A breakpoint with values for small, medium, large, extra-large, extra-extra-large, and always.
 * @typedef {'10'|'25'|'50'|'75'} Opacity - An opacity value in percent.
 * @typedef {'0'|'1'|'2'|'3'|'4'|'5'} Spacer - A spacer value for spacing properties.
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
 * 'white'} ColorExtra - An extra color value with subtle variants.
 * @typedef {'primary'|
 * 'secondary'|
 * 'success'|
 * 'danger'|
 * 'warning'|
 * 'info'|
 * 'light'|
 * 'dark'} Color - A base color value.
 */

/**
 * Extend component
 * @typedef {Object} ComponentExtend
 * @property {ComponentProperty[]} [properties] - Properties to modify the component.
 * @property {ComponentMixinMetadata} [metadata] - Metadata for mixins applied to the component.
 * @property {ComponentEvent[] | Object.<string, *>[]} [events] - Events to add or override.
 * @property {boolean} [clearDefaultEvents] - Clear default events when extending the component.
 * @property {Array<Component|ComponentInstance>} [children] - Child components to include in the component.
 */

/**
 * Component data and metadata
 * @typedef {ComponentDataValues & ComponentData & ComponentMetadata} Component
 */

/**
 * Metadata for a component
 * @typedef {Object} ComponentMetadata
 * @property {'link'|'section'|'img'|'input'|'element'} [type] - Type of the component.
 * @property {string} [hash] - Hash value associated with the component.
 * @property {Function} [component] - Lazy load custom web component.
 * @property {boolean} [isLoaded] - Flag indicating if the web component is loaded.
 * @property {string} [parentId] - Id of the parent component if the component was extended.
 * @property {ComponentMixinMetadata[]} [mixins]  - Metadata for mixins applied to the component.
 */

/**
 * Options data structure
 * @typedef {Object.<string, (Object.<string,ComponentOptionItem>|ComponentOptionItem)>} ComponentOption
 */

/**
 * Option item for a specific property
 * @typedef {Object} ComponentOptionItem
 * @property {string} name - Name of the attribute or setter.
 * @property {boolean} [replace] - Replace property value.
 * @property {boolean} [toggle] - Toggle property value.
 * @property {Object.<string, (string|boolean)>} [values] - Attribute values
 * @property {string|boolean} [value] - Attribute value
 * @property {Function} [computedValue]
 * @property {Infix} [infixValues] - Class names that often have breakpoints
 */

/**
 * Component property modification behaviour
 * @typedef {Object} ComponentProperty
 * @property {string} name - Name of element attribute or property.
 * @property {boolean} [replace] - Replace property value.
 * @property {boolean} [toggle] - Toggle property value.
 * @property {string|boolean} value - Property value.
 */

/**
 * Component instance data
 * @typedef {Object} ComponentInstance
 * @property {string} id - Unique identifier for the component instance.
 * @property {'link'|'section'|'img'|'input'|'element'} [type] - Type of the component instance.
 * @property {string} [parentId] - The parent component Id if instance was extended
 * @property {string} hash - Hash value associated with the parent component.
 * @property {Array<Component|ComponentInstance|string>} [children] - Child components or IDs.
 * @property {ComponentEvent[]} [events] - Events attached to the component instance.
 * @property {ComponentProperty[]} [properties] - Properties of the component instance.
 */

/**
 * Metadata for a mixin
 * @typedef {Object} ComponentMixinMetadata
 * @property {string} id - Identifier for the mixin.
 * @property {string} [hash] - Hash value associated with the mixin.
 */

/**
 * Base event listener types
 * @typedef {'component/beforeChildren'|
 * 'component/created'|
 * 'component/mounted'|
 * 'component/childrenAfterUpdate'|
 * 'component/childrenBeforeUpdate'} ComponentEventOn - Base events listeners for components.
 */

/**
 * Event definition for a component
 * @typedef {Object} ComponentEvent
 * @property {ComponentEventOn} on - Event type
 * @property {string} actionId - Unique identifier for the event action.
 */

/**
 * Data values and metadata for a component
 * @typedef {Object} ComponentDataValues
 * @property {'link'|'section'|'img'|'input'|'element'} [type] - Type of the component.
 * @property {Array<Component|ComponentInstance|string>} [children] - Child components or IDs.
 * @property {Array<Component|ComponentInstance|string>} [allowedChildren] - Allowed nested components.
 * @property {Object[]} [content] - Define content structure
 * @property {string} content[].name - Name of content property
 * @property {string} content[].nodePropertyName - Property name
 * @property {ComponentEvent[]} [events] - Events attached to the component.
 * @property {Object.<string, boolean>} [eventTypes] - Event types enabled or disabled.
 * @property {ComponentProperty[]} [properties] - Properties of the component.
 * @property {ComponentOption} [options] - Options for customizing the component.
 * @property {Object[]} [styles] - Define styling properties.
 * @property {string} styles[].name - Style property name.
 * @property {'unit'|'box-shadow'|'font-family'|'rgba'|'units'|'number'} styles[].type - Style property name
 */

/**
 * @import {EventEmit} from '../../plugins/src/core/event.js'
 * @callback EventEmitCallback
 * @param {EventEmit} param
 */

/**
 * @typedef {Object} ComponentContext
 * @property {string} id - Component ID.
 * @property {string} [parentId] - Parent component ID if extending.
 * @property {string} [rootId] - Root template ID.
 * @property {string} [groupId] - Group template ID.
 * @property {Component} [template] - Template component data.
 */

/**
 * Initialize component and events
 * @callback ComponentInitializeCallback
 * @param {ComponentContext} context - Component context
 * @param {EventEmitCallback} emit - Callback function for emitting events.
 */

/**
 * Data structure for a component
 * @typedef {Object} ComponentData
 * @property {string} id - Unique identifier for the component.
 * @property {Function} [component] - Lazy load component function.
 * @property {ComponentInitializeCallback} [initialize] - Add event listeners, or perform any other required setup tasks..
 * @property {string} tag - Element tag name.
 */

/**
 * Infix definition with base class, possible infixes, separator, and suffix
 * @typedef {Object} Infix
 * @property {string} className - Base class name for the component.
 * @property {InfixItem[]} infixes - Possible class names that may include breakpoints.
 * @property {string} [separator='-'] - Separator between infixes.
 * @property {string} [suffix] - Suffix value after infixes.
 */

/**
 * Infix item with values, name, and separator
 * @typedef {Object} InfixItem
 * @property {Object.<string, string>} [values] - A map of all possible infix values.
 * @property {string} name - The key name to match the possible values.
 * @property {string} [separator] - Separator within an infix item.
 */
