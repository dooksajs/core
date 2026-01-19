/**
 * @import { DataSchema, DataSchemaObject, DataSchemaItem} from '../types.js'
 * @import { Mock } from 'node:test'
 */

/**
 * Plugin metadata containing display information and configuration.
 * Used to identify and describe plugins throughout the application.
 *
 * @typedef {Object} DsPluginMetadata
 * @property {string} title - Human-readable plugin name displayed in UI
 * @property {string} [description] - Detailed description of plugin functionality
 * @property {string} [icon] - Icon identifier for visual representation (e.g., 'mdi-home')
 * @property {string} [component] - Associated component ID for plugin integration
 */

/**
 * Plugin metadata with unique identifier.
 * Extends DsPluginMetadata with an additional ID field for unique identification.
 *
 * @typedef {Object} DsPluginMetadataUnique
 * @property {string} id - Unique identifier for the plugin instance
 * @property {string} title - Human-readable plugin name displayed in UI
 * @property {string} [description] - Detailed description of plugin functionality
 * @property {string} [icon] - Icon identifier for visual representation
 * @property {string} [component] - Associated component ID for plugin integration
 */

/**
 * Plugin state configuration containing schema and default values.
 * Defines the structure and initial values for plugin state management.
 *
 * @typedef {Object} DsPluginState
 * @property {Object} [defaults] - Default values for state properties
 * @property {DsPluginSchema} schema - Schema definition for state structure
 */

/**
 * Plugin state schema definition.
 * Maps state property names to their DataSchema definitions.
 *
 * @typedef {Object.<string, DataSchema>} DsPluginSchema
 */

/**
 * Represents a processed state schema item with compiled entries.
 * Used internally to track state collection structure and metadata.
 *
 * @typedef {Object} DsPluginSchemaItem
 * @property {string} name - Name of the state collection
 * @property {Schema[]} entries - Parsed schema entries for the collection
 * @property {boolean} isCollection - Whether this is a collection type
 */

/**
 * Default value configuration for a state collection.
 * Defines the initial value for a specific state property.
 *
 * @typedef {Object} DsPluginStateDefaults
 * @property {string} name - Name of state collection (format: 'pluginName/propertyName')
 * @property {*} value - Default value for the state collection
 */

/**
 * Exported state object containing compiled schema and default values.
 * Used internally by the plugin system to manage state.
 *
 * @typedef {Object} DsPluginStateExport
 * @property {DsPluginSchemaDefaults} _values - Initial values for all state properties
 * @property {string[]} _names - Array of all state collection names
 * @property {DsPluginSchemaItem[]} _items - Processed schema items with metadata
 * @property {DsPluginSchema} schema - State schema definition
 * @property {Object} [defaults] - Default state values (deprecated, use _defaults)
 * @property {DsPluginStateDefaults[]} [_defaults] - Default state values array
 */

/**
 * Action parameter schema definition.
 * Defines the structure and validation rules for action parameters.
 * Used for parameter validation and UI generation.
 *
 * @typedef {Object} DsPluginActionParameter
 * @property {'string'|'number'|'array'|'object'|'boolean'} [type] - Parameter data type
 * @property {Object.<string, DsPluginActionParameterItem>} [properties] - Object properties (for 'object' type)
 * @property {DsPluginActionParameterItem} [items] - Array item schema (for 'array' type)
 */

/**
 * Detailed schema for action parameter items.
 * Defines validation rules and metadata for individual parameter properties.
 *
 * @typedef {Object} DsPluginActionParameterItem
 * @property {string} [title] - Human-readable label for the parameter
 * @property {'string'|'number'|'array'|'object'|'boolean'|'any'|'primitives'} type - Parameter data type
 * @property {string} [group] - Group identifier for parameter organization
 * @property {Object.<string, DsPluginActionParameterItem>} [properties] - Object properties (for 'object' type)
 * @property {DsPluginActionParameterItem} [items] - Array item schema (for 'array' type)
 * @property {boolean} [required] - Whether this parameter is required
 * @property {number} [maxItems] - Maximum number of items (for array types)
 */

/**
 * Plugin action definition.
 * Represents a Dooksa function with metadata and optional parameter schema.
 * Actions are executable functions that can be called from the plugin system.
 *
 * @typedef {Object} DsPluginAction
 * @property {Function} method - The actual function implementation
 * @property {DsPluginMetadata|DsPluginMetadataUnique[]} metadata - Metadata for display and identification
 * @property {DsPluginActionParameter} [parameters] - Parameter schema for validation and UI generation
 */

/**
 * Maps action definitions to their method implementations.
 * Extracts the method function from each action in the type map.
 *
 * @template {Object.<string, DsPluginAction>} T - Object mapping action names to DsPluginAction definitions
 * @typedef {{ [K in keyof T]: T[K]["method"] }} DsPluginActionMapper
 */

/**
 * Maps method definitions to their function implementations.
 * Preserves the original function types from the method map.
 *
 * @template {Object.<string, Function>} T - Object mapping method names to function types
 * @typedef {{ [K in keyof T]: T[K] }} DsPluginMethodMapper
 */

/**
 * Action named exports with namespaced method names.
 * Creates exported action methods with the format: {pluginName}{ActionName}
 *
 * @template {string} Name - Plugin name prefix
 * @template {Object.<string, DsPluginAction>} Action - Object mapping action names to DsPluginAction definitions
 * @typedef {{ [K in keyof Action as `${Name}${Capitalize<string & K>}`]: Action[K]["method"] }} DsPluginModuleAction
 */

/**
 * Method named exports with namespaced method names.
 * Creates exported method methods with the format: {pluginName}{MethodName}
 *
 * @template {string} Name - Plugin name prefix
 * @template {DsPluginMethods} Method - Object mapping method names to function types
 * @typedef {{ [K in keyof Method as `${Name}${Capitalize<string & K>}`]: Method[K] }} DsPluginModuleMethod
 */

/**
 * Action for application with underscore-separated names.
 * Creates exported action methods with the format: {pluginName}_{actionName}
 * Used for application-level action registration.
 *
 * @template {string} Name - Plugin name prefix
 * @template {Object.<string, DsPluginAction>} Action - Object mapping action names to DsPluginAction definitions
 * @typedef {{ [K in keyof Action as `${Name}_${string & K}`]: Action[K]["method"]  } } DsPluginAppAction
 */

/**
 * Plugin schema default values.
 * Maps state property names to their initial default values.
 *
 * @typedef {Object.<string, ({}|[]|number|string|boolean)>} DsPluginSchemaDefaults - Initial values
 */

/**
 * Plugin getters object containing plugin metadata and dependencies.
 * Used to retrieve plugin information and manage plugin relationships.
 *
 * @typedef {Object} DsPluginGetters
 * @property {string} name - DsPlugin name
 * @property {DsPluginMetadata | undefined} metadata - Plugin metadata if available
 * @property {DsPluginGetters[] | undefined} dependencies - Array of dependent plugins
 * @property {ActiveAction[] | undefined} actions - Array of active actions
 * @property {DsPluginStateExport} state - Global state for the state DsPlugin
 */

/**
 * Plugin data type.
 * Represents the data structure for a plugin, mapping property names to their values.
 *
 * @typedef {Object.<string, *>} DsPluginData
 */

/**
 * Options for creating a new plugin instance.
 * Allows customization of data values and naming for plugin instances.
 *
 * @template {DsPluginData} Data - The data type for the plugin
 * @typedef {Object} DsPluginInstanceOptions
 * @property {Partial<Data>} [data] - Override data values for the new instance
 * @property {string} [name] - Custom name for the new instance (optional)
 */

/**
 * Plugin test utilities.
 * Contains methods for testing plugin functionality.
 *
 * @typedef {Object} PluginTest
 * @property {Function} [restore] - Restore plugins internal context
 * @property {Function} [createObservableInstance] - Create an observable instance for testing
 */

/**
 * Plugin setup configuration.
 * Contains the setup function that initializes the plugin.
 *
 * @template {Function} T - The setup function type
 * @typedef {Object} PluginSetup
 * @property {T} [setup] - Setup function for plugin
 */

/**
 * Plugin mock callback for testing.
 * Creates a mock version of the plugin for testing purposes.
 *
 * @template {string} Name - Plugin name
 * @template {DsPluginMethods} Methods - Plugin methods
 * @template {DsPluginActions} Actions - Plugin actions
 * @template {Function} Setup - Setup function
 * @template {DsPluginData} [Data=any] - Plugin data type
 * @template {DsPluginMethods} [PrivateMethods=any] - Private methods
 * @callback PluginMock
 * @param {TestContext} context - Test context for mocking
 * @returns {DsPluginExport} - Mocked plugin export
 */

/**
 * Mapped mocks for observable instances.
 * Contains mock functions for all methods, actions, private methods, and setup.
 *
 * @template {Object<string, Function>} Methods - Object mapping method names to function types
 * @template {Object<string, DsPluginAction>} Actions - Object mapping action names to DsPluginAction definitions
 * @template {Object<string, Function>} PrivateMethods - Object mapping private method names to function types
 * @template {Function} Setup - Setup function type
 * @typedef {{
 * [K in keyof Methods]: Mock<Methods[K]>
 * } & {
 * [K in keyof Actions]: Mock<Actions[K]["method"]>
 * } & {
 * [K in keyof PrivateMethods]: Mock<PrivateMethods[K]>
 * } & {
 * setup?: Mock<Setup>
 * }} DsPluginMocks
 */

/**
 * The observable instance returned by createObservableInstance.
 * Contains the plugin export with mock functions accessible via the observe property.
 *
 * @template {string} Name - Plugin name
 * @template {DsPluginMethods} Methods - Plugin methods
 * @template {DsPluginActions} Actions - Plugin actions
 * @template {DsPluginMethods} PrivateMethods - Private methods
 * @template {Function} Setup - Setup function
 * @typedef {DsPluginExport<Name, Methods, Actions, Setup> & {
 * observe: DsPluginMocks<Methods, Actions, PrivateMethods, Setup>
 * }} DsPluginObservable
 */


/**
 * Lifecycle methods added to the plugin object.
 * Provides methods for creating instances, observable instances for testing, and restoring original state.
 *
 * @template {string} Name - Plugin name
 * @template {DsPluginData} Data - Plugin data type
 * @template {DsPluginMethods} Methods - Plugin methods
 * @template {DsPluginMethods} PrivateMethods - Private methods
 * @template {DsPluginActions} Actions - Plugin actions
 * @template {Function} Setup - Setup function
 * @typedef {Object} DsPluginLifecycle
 * @property {(options?: DsPluginInstanceOptions<Data>) => DsPluginExport<Name, Methods, Actions, Setup>} [createInstance] - Creates a new plugin instance with optional data overrides
 * @property {(testContext: import('node:test').TestContext) => DsPluginObservable<Name, Methods, Actions, PrivateMethods, Setup>} [createObservableInstance] - Creates an observable instance for testing with mock functions
 * @property {() => void} [restore] - Restores the plugin to its original state after testing
 */

/**
 * Complete plugin export type.
 * Combines all plugin functionality including methods, actions, getters, setup, and lifecycle.
 *
 * @template {string} Name - Plugin name
 * @template {DsPluginMethods} Methods - Plugin methods
 * @template {DsPluginActions} Actions - Plugin actions
 * @template {Function} Setup - Setup function
 * @template {DsPluginData} [Data=any] - Plugin data type
 * @template {DsPluginMethods} [PrivateMethods=any] - Private methods
 * @typedef {DsPluginModuleMethod<Name, Methods> &
 * DsPluginModuleAction<Name, Actions> &
 * DsPluginGetters &
 * PluginSetup<Setup> &
 * DsPluginLifecycle<Name, Data, Methods, PrivateMethods, Actions, Setup>
 * } DsPluginExport
 */

/**
 * Plugin configuration object used to create a plugin.
 * Contains all the necessary configuration for creating a Dooksa plugin.
 *
 * @template {string} Name - Plugin name
 * @template {DsPluginData} Data - Plugin data type
 * @template {DsPluginMethods} Methods - Plugin methods
 * @template {DsPluginMethods} PrivateMethods - Private methods
 * @template {DsPluginActions} Actions - Plugin actions
 * @template {Function} Setup - Setup function
 * @typedef {Object} DsPluginConfig
 * @property {string} name - Plugin name
 * @property {'client'|'server'} platform - Target platform for the plugin
 * @property {DsPluginGetters[]} [dependencies] - Array of plugin dependencies
 * @property {DsPluginState} [state] - Plugin state configuration
 * @property {DsPluginMetadata} [metadata] - Plugin metadata
 * @property {Data} [data] - Plugin data
 * @property {Methods} [methods] - Public methods
 * @property {PrivateMethods} [privateMethods] - Private methods
 * @property {Actions} [actions] - Plugin actions
 * @property {Setup} [setup] - Setup function
 */

/**
 * Active action registration.
 * Contains the action method, metadata, and parameter schema for execution.
 *
 * @typedef {Object} ActiveAction
 * @property {string} key - Original key name
 * @property {string} name - Namespaced method name [pluginName]_[key]
 * @property {Function} method - Method
 * @property {DsPluginActionParameter} [parameters] - Method parameter schema used by the action system
 * @property {DsPluginActionMetadata[]} metadata - Metadata to display method information
 */

/**
 * Plugin methods map.
 * Maps method names to their function implementations.
 *
 * @typedef {Object.<string, Function>} DsPluginMethods
 */

/**
 * Action metadata with plugin and method information.
 * Extends DsPluginMetadataUnique with plugin and method identifiers.
 *
 * @typedef {DsPluginMetadataUnique & { plugin: string, method: string }} DsPluginActionMetadata
 */

/**
 * Plugin actions map.
 * Maps action names to their DsPluginAction definitions.
 *
 * @typedef {Object.<string, DsPluginAction>} DsPluginActions
 */

/**
 * Plugin options configuration.
 * Contains all the configuration options for creating a Dooksa plugin.
 *
 * @template {string} Name - Plugin name
 * @template {DsPluginData} Data - Plugin data type
 * @template {DsPluginMethods} Methods - Plugin methods
 * @template {DsPluginMethods} PrivateMethods - Private methods
 * @template {DsPluginActions} Actions - Plugin actions
 * @template {Function} Setup - Setup function
 * @typedef {Object} DsPluginOptions
 * @property {DsPluginGetters[]} [dependencies] - Array of plugin dependencies
 * @property {DsPluginState} [state] - Plugin state configuration
 * @property {DsPluginMetadata} [metadata] - Plugin metadata
 * @property {Data} [data] - Plugin data
 * @property {Methods} [methods] - Public methods
 * @property {PrivateMethods} [privateMethods] - Private methods
 * @property {Actions} [actions] - Plugin actions
 * @property {Setup} [setup] - Setup function
 */

/**
 * Schema definition for data structure validation.
 * Defines the structure and validation rules for data schemas.
 *
 * @typedef {Object} Schema
 * @property {string} [id] - Unique identifier for the schema
 * @property {SchemaEntry} entry - Entry definition for the schema
 * @property {DataSchemaItem} [items] - Schema items for array types
 * @property {Object.<string, DataSchemaObject>} [entryProperties] - Entry properties
 * @property {Object.<string, DataSchemaObject>} [entryPatternProperties] - Entry pattern properties
 * @property {SchemaObjectProperty[]} [properties] - Object properties
 * @property {SchemaObjectProperty[]} [patternProperties] - Pattern properties for dynamic keys
 */

/**
 * Property definition for object schemas.
 * Defines a single property within an object schema with its type and validation rules.
 *
 * @typedef {Object} SchemaObjectProperty
 * @property {string} name - Name of property
 * @property {'string' | 'number' | 'boolean' | 'object' | 'array'} type - Data type
 * @property {DataSchemaItem} [items] - Schema items for array types
 * @property {DataSchemaObject} [properties] - Nested object properties
 * @property {DataSchemaObject} [patternProperties] - Pattern properties for dynamic keys
 * @property {boolean} [required] - Whether this property is required
 * @property {boolean} [allowedProperties] - Whether additional properties are allowed
 */


/**
 * Options for schema object validation.
 * Defines additional validation rules and constraints for object schemas.
 *
 * @typedef {Object} SchemaObjectOptions
 * @property {Object.<string, boolean>} [allowedProperties] - Map of allowed property names
 * @property {boolean} [additionalProperties] - Whether additional properties are allowed
 * @property {Function} [default] - Default value function
 * @property {string[]} [required] - Array of required property names
 * @property {boolean} [uniqueItems] - Whether array items must be unique
 * @property {string} [relation] - Relation identifier for linked data
 */

/**
 * Default collection ID configuration.
 * Defines how to generate default IDs for collection items.
 *
 * @typedef {Object} SchemaCollectionDefaultId - Default collection ID
 * @property {Function | string} [default] - Default ID value or function
 * @property {Function | string} [prefix] - Prefix for generated IDs
 * @property {Function | string} [suffix] - Suffix for generated IDs
 */

/**
 * Schema type enumeration.
 * Defines the supported data types for schema definitions.
 *
 * @typedef {'string' | 'number' | 'boolean' | 'object' | 'array' | 'collection'} SchemaType
 */

/**
 * Schema entry definition.
 * Defines a single entry within a schema with its type and validation rules.
 *
 * @typedef {Object} SchemaEntry
 * @property {SchemaType} type - Data type for this entry
 * @property {string} [name] - Name of the entry
 * @property {SchemaObjectOptions} [options] - Validation options for the entry
 * @property {SchemaCollectionDefaultId} [id] - Default ID configuration for collections
 * @property {SchemaObjectProperty[]} [properties] - Object properties (for 'object' type)
 * @property {SchemaObjectProperty[]} [patternProperties] - Pattern properties for dynamic keys
 */
