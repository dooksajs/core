/**
 * @import { DataSchema, DataSchemaObject, DataSchemaItem} from '../types.js'
 */

/**
 * @typedef {Object} PluginMetadata
 * @property {string} title
 * @property {string} [description]
 * @property {string} [icon]
 * @property {string} [component]
 */

/**
 * @typedef {Object} PluginMetadataUnique
 * @property {string} id,
 * @property {string} title
 * @property {string} [description]
 * @property {string} [icon]
 * @property {string} [component]
 */

/**
 * @typedef {Object.<string, DataSchema>} PluginSchema
 */

/**
 * @typedef {Object} PluginSchemaItem
 * @property {string} name
 * @property {Schema[]} entries
 * @property {boolean} isCollection
 */

/**
 * @typedef {Object} PluginSchemaGetter
 * @property {PluginSchemaDefaults} $values
 * @property {string[]} $names
 * @property {PluginSchemaItem[]} $items
 */

/**
 * @template Context
 * @callback PluginMethod
 * @this {Context}
 * @param {*} [param]
 * @param {PluginActionContext} [context]
 */

/**
 * @typedef {Object} PluginActionParameter
 * @property {'string'|'number'|'array'|'object'|'boolean'} [type]
 * @property {Object.<string, PluginActionParameterItem>} [properties]
 * @property {PluginActionParameterItem} [items]
 */

/**
 * @typedef {Object} PluginActionParameterItem
 * @property {string} [title]
 * @property {'string'|'number'|'array'|'object'|'boolean'|'any'|'primitives'} type
 * @property {string} [group]
 * @property {Object.<string, PluginActionParameterItem>} [properties]
 * @property {PluginActionParameterItem} [items]
 * @property {boolean} [required]
 * @property {number} [maxItems]
 */

/**
 * @typedef {Object} PluginAction - Dooksa function
 * @property {Function} method
 * @property {PluginMetadata|PluginMetadataUnique[]} metadata
 * @property {PluginActionParameter} [parameters]
 */

/**
 * @template {Object.<string, PluginAction>} T
 * @typedef {{ [K in keyof T]: T[K]["method"] }} PluginActionMapper
 */

/**
 * @template {Object.<string, Function>} T
 * @typedef {{ [K in keyof T]: T[K] }} PluginMethodMapper
 */

/**
 * Action named exports
 * @template {string} Name
 * @template {Object.<string, PluginAction>} Action
 * @typedef {{ [K in keyof Action as `${Name}${Capitalize<string & K>}`]: Action[K]["method"] }} PluginModuleAction
 */

/**
 * Method named exports
 * @template {string} Name
 * @template {Object.<string, Function>} Method
 * @typedef {{ [K in keyof Method as `${Name}${Capitalize<string & K>}`]: Method[K] }} PluginModuleMethod
 */

/**
 * Action for application
 * @template {string} Name
 * @template {Object.<string, PluginAction>} Action
 * @typedef {{ [K in keyof Action as `${Name}_${string & K}`]: Action[K]["method"]  } } PluginAppAction
 */

/**
 * @typedef {Object.<string, ({}|[]|number|string|boolean)>} PluginSchemaDefaults - Initial values
 */

/**
 * @typedef {Object} PluginGetters
 * @property {string} name - Plugin name
 * @property {PluginMetadata | undefined} metadata
 * @property {PluginGetters[] | undefined} dependencies
 * @property {ActiveAction[] | undefined} actions
 * @property {PluginSchema & PluginSchemaGetter | undefined} schema - Schema for the data plugin
 */

/**
 * @typedef {PluginGetters & Object.<string, *>} Plugin
 */

/**
 * @template {string} Name
 * @template {PluginMethods} Methods
 * @template {PluginActions} Actions
 * @template {Function} Setup
 * @typedef {PluginModuleMethod<Name, Methods> &
*  PluginModuleAction<Name, Actions> &
*  PluginGetters &
*  { setup: Setup }
* } PluginExport
*/

/**
* @typedef {Object} ActiveAction
* @property {string} name - Method name
* @property {Function} method - Method
* @property {PluginActionParameter} [parameters]
* @property {PluginActionMetadata[]} metadata
*/

/**
* @typedef {Object.<string, Function>} PluginMethods
*/

/**
* @typedef {PluginMetadataUnique & { plugin: string, method: string }} PluginActionMetadata
* @typedef {Object.<string, PluginAction>} PluginActions
* @typedef {Object.<string, *>} PluginData
*/

/**
* @template {string} Name
* @template {PluginData} Data
* @template {PluginMethods} Methods
* @template {PluginActions} Actions
* @template {Function} Setup
* @typedef {Object} PluginOptions
* @property {PluginGetters[]} [plugin.dependencies]
* @property {PluginSchema} [plugin.schema]
* @property {PluginMetadata} [plugin.metadata]
* @property {Data} [data]
* @property {Methods} [methods]
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
