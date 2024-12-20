/**
 * @import { DataSchema, DataSchemaObject, DataSchemaItem} from '../types.js'
 */

/**
 * @typedef {Object} DsPluginMetadata
 * @property {string} title
 * @property {string} [description]
 * @property {string} [icon]
 * @property {string} [component]
 */

/**
 * @typedef {Object} DsPluginMetadataUnique
 * @property {string} id
 * @property {string} title
 * @property {string} [description]
 * @property {string} [icon]
 * @property {string} [component]
 */

/**
 * @typedef {Object} DsPluginState
 * @property {Object} [defaults]
 * @property {DsPluginSchema} schema
 */

/**
 * @typedef {Object.<string, DataSchema>} DsPluginSchema
 */

/**
 * @typedef {Object} DsPluginSchemaItem
 * @property {string} name
 * @property {Schema[]} entries
 * @property {boolean} isCollection
 */

/**
 * @typedef {Object} DsPluginStateDefaults
 * @property {string} name - Name of state collection
 * @property {*} value - Default value
 */

/**
 * @typedef {Object} DsPluginStateExport
 * @property {DsPluginSchemaDefaults} _values
 * @property {string[]} _names
 * @property {DsPluginSchemaItem[]} _items
 * @property {DsPluginSchema} schema - State schema
 * @property {Object} [defaults] - Default state values
 * @property {DsPluginStateDefaults[]} [_defaults] - Default state values
 */

/**
 * @typedef {Object} DsPluginActionParameter
 * @property {'string'|'number'|'array'|'object'|'boolean'} [type]
 * @property {Object.<string, DsPluginActionParameterItem>} [properties]
 * @property {DsPluginActionParameterItem} [items]
 */

/**
 * @typedef {Object} DsPluginActionParameterItem
 * @property {string} [title]
 * @property {'string'|'number'|'array'|'object'|'boolean'|'any'|'primitives'} type
 * @property {string} [group]
 * @property {Object.<string, DsPluginActionParameterItem>} [properties]
 * @property {DsPluginActionParameterItem} [items]
 * @property {boolean} [required]
 * @property {number} [maxItems]
 */

/**
 * @typedef {Object} DsPluginAction - Dooksa function
 * @property {Function} method
 * @property {DsPluginMetadata|DsPluginMetadataUnique[]} metadata
 * @property {DsPluginActionParameter} [parameters]
 */

/**
 * @template {Object.<string, DsPluginAction>} T
 * @typedef {{ [K in keyof T]: T[K]["method"] }} DsPluginActionMapper
 */

/**
 * @template {Object.<string, Function>} T
 * @typedef {{ [K in keyof T]: T[K] }} DsPluginMethodMapper
 */

/**
 * Action named exports
 * @template {string} Name
 * @template {Object.<string, DsPluginAction>} Action
 * @typedef {{ [K in keyof Action as `${Name}${Capitalize<string & K>}`]: Action[K]["method"] }} DsPluginModuleAction
 */

/**
 * Method named exports
 * @template {string} Name
 * @template {DsPluginMethods} Method
 * @typedef {{ [K in keyof Method as `${Name}${Capitalize<string & K>}`]: Method[K] }} DsPluginModuleMethod
 */

/**
 * Action for application
 * @template {string} Name
 * @template {Object.<string, DsPluginAction>} Action
 * @typedef {{ [K in keyof Action as `${Name}_${string & K}`]: Action[K]["method"]  } } DsPluginAppAction
 */

/**
 * @typedef {Object.<string, ({}|[]|number|string|boolean)>} DsPluginSchemaDefaults - Initial values
 */

/**
 * @typedef {Object} DsPluginGetters
 * @property {string} name - DsPlugin name
 * @property {DsPluginMetadata | undefined} metadata
 * @property {DsPluginGetters[] | undefined} dependencies
 * @property {ActiveAction[] | undefined} actions
 * @property {DsPluginStateExport} state - Global state for the state DsPlugin
 */

/**
 * @typedef {DsPluginGetters & Object.<string, *>} DsPlugin
 */

/**
 * @template {string} Name
 * @template {DsPluginMethods} Methods
 * @template {DsPluginActions} Actions
 * @template {Function} Setup
 * @typedef {DsPluginModuleMethod<Name, Methods> &
*  DsPluginModuleAction<Name, Actions> &
*  DsPluginGetters &
*  { setup: Setup }
* } DsPluginExport
*/

/**
* @typedef {Object} ActiveAction
* @property {string} name - Method name
* @property {Function} method - Method
* @property {DsPluginActionParameter} [parameters]
* @property {DsPluginActionMetadata[]} metadata
*/

/**
 * @typedef {Object.<string, Function>} DsPluginMethods
 */

/**
* @typedef {DsPluginMetadataUnique & { DsPlugin: string, method: string }} DsPluginActionMetadata
* @typedef {Object.<string, DsPluginAction>} DsPluginActions
* @typedef {Object.<string, *>} DsPluginData
*/

/**
* @template {string} Name
* @template {DsPluginData} Data
* @template {DsPluginMethods} Methods
* @template {DsPluginMethods} PrivateMethods
* @template {DsPluginActions} Actions
* @template {Function} Setup
* @typedef {Object} DsPluginOptions
* @property {DsPluginGetters[]} [DsPlugin.dependencies]
* @property {DsPluginState} [DsPlugin.state]
* @property {DsPluginMetadata} [DsPlugin.metadata]
* @property {Data} [data]
* @property {Methods} [methods]
* @property {PrivateMethods} [privateMethods]
* @property {Actions} [actions]
* @property {Setup} [setup]
*/

/**
 * @typedef {Object} Schema
 * @property {string} [id]
 * @property {SchemaEntry} entry
 * @property {DataSchemaItem} [items]
 * @property {Object.<string, DataSchemaObject>} [entryProperties]
 * @property {Object.<string, DataSchemaObject>} [entryPatternProperties]
 * @property {SchemaObjectProperty[]} [properties]
 * @property {SchemaObjectProperty[]} [patternProperties]
 */

/**
 * @typedef {Object} SchemaObjectProperty
 * @property {string} name - Name of property
 * @property {'string' | 'number' | 'boolean' | 'object' | 'array'} type - Data type
 * @property {DataSchemaItem} [items]
 * @property {DataSchemaObject} [properties]
 * @property {DataSchemaObject} [patternProperties]
 * @property {boolean} [required]
 * @property {boolean} [allowedProperties]
 */


/**
 * @typedef {Object} SchemaObjectOptions
 * @property {Object.<string, boolean>} [allowedProperties]
 * @property {boolean} [additionalProperties]
 * @property {Function} [default]
 * @property {string[]} [required]
 * @property {boolean} [uniqueItems]
 * @property {string} [relation]
 */

/**
 * @typedef {Object} SchemaCollectionDefaultId - Default collection ID
 * @property {Function | string} [default]
 * @property {Function | string} [prefix]
 * @property {Function | string} [suffix]
 */

/**
 * @typedef {'string' | 'number' | 'boolean' | 'object' | 'array' | 'collection'} SchemaType
 */

/**
 * @typedef {Object} SchemaEntry
 * @property {SchemaType} type
 * @property {string} [name]
 * @property {SchemaObjectOptions} [options]
 * @property {SchemaCollectionDefaultId} [id]
 * @property {SchemaObjectProperty[]} [properties]
 * @property {SchemaObjectProperty[]} [patternProperties]
 */
