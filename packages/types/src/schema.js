/**
 * @typedef {Object} DataSchema - Dooksa data schema definition used for validation and parsing
 *
 * Defines the structure and constraints for data stored in the state management system.
 * Used extensively in schema parsing (packages/create-plugin/src/parse-schema.js) and
 * validation (packages/plugins/src/core/state.js).
 *
 * @property {('collection'|'object'|'array'|'string'|'number'|'boolean')} type - The data type.
 *   'collection' is a special type for grouped data with auto-generated IDs.
 * @property {DataSchemaItem} [items] - For array/collection types, defines the schema of items.
 *   Used when type is 'array' or 'collection'.
 * @property {Object.<string, DataSchemaObject>} [properties] - For object types, defines schemas
 *   for specific property names. Used when type is 'object'.
 * @property {Object.<string, DataSchemaObject>} [patternProperties] - For object types, defines
 *   schemas for property names matching regex patterns. Example: { '[0-9]': { type: 'string' } }
 * @property {(Function|string)} [suffixId] - Collection suffix generator. Can be a function that
 *   returns a string or a static string. Applied to collection document IDs.
 * @property {(Function|string)} [prefixId] - Collection prefix generator. Can be a function that
 *   returns a string or a static string. Applied to collection document IDs.
 * @property {Function} [defaultId] - Function that generates the default ID for collection items.
 *   If not provided, a random ID is generated using generateId().
 * @property {string[]} [required] - List of required property names that must exist and contain
 *   a value. Validation throws DataSchemaException if missing.
 * @property {string} [relation] - Name of data collection the foreign key is related to.
 *   Creates bidirectional relationships for cascade operations and data integrity.
 * @property {boolean} [uniqueItems] - When true, ensures each item in an array is unique.
 *   Validation throws DataSchemaException.uniqueItems() if duplicates are found.
 * @property {boolean} [additionalProperties] - When false, only properties defined in 'properties'
 *   or matching 'patternProperties' are allowed. Defaults to true if not specified.
 */

/**
 * @typedef {Object} DataSchemaItem - Dooksa data schema for array items and nested structures
 *
 * Defines the schema for individual items within arrays or nested object properties.
 * Used when parsing array schemas in packages/create-plugin/src/parse-schema.js.
 *
 * @property {('object'|'array'|'string'|'number'|'boolean')} type - The data type of the item
 * @property {DataSchemaItem} [items] - For array items, defines the schema of nested array items
 * @property {Object.<string, DataSchemaObject>} [properties] - For object items, defines schemas
 *   for specific property names
 * @property {Object.<string, DataSchemaObject>} [patternProperties] - For object items, defines
 *   schemas for property names matching regex patterns
 * @property {string[]} [required] - List of required property names for object items
 * @property {string} [relation] - Name of data collection the foreign key is related to.
 *   Creates bidirectional relationships for cascade operations
 * @property {boolean} [uniqueItems] - When true, ensures each item in the array is unique.
 *   Validation throws DataSchemaException.uniqueItems() if duplicates are found
 */

/**
 * @typedef {Object} DataSchemaObject - Dooksa data schema for object properties
 *
 * Defines the schema for individual object properties within a parent object schema.
 * Used when parsing object schemas with properties in packages/create-plugin/src/parse-schema.js.
 *
 * @property {('object'|'array'|'string'|'number'|'boolean')} type - The data type of the property
 * @property {DataSchemaItem} [items] - For array properties, defines the schema of array items
 * @property {Object.<string, DataSchemaObject>} [properties] - For object properties, defines schemas
 *   for nested property names
 * @property {Object.<string, DataSchemaObject>} [patternProperties] - For object properties, defines
 *   schemas for property names matching regex patterns
 * @property {boolean} [additionalProperties] - When false, only properties defined in 'properties'
 *   or matching 'patternProperties' are allowed. Defaults to true if not specified
 * @property {string} [relation] - Name of data collection the foreign key is related to.
 *   Creates bidirectional relationships for cascade operations
 * @property {string[]} [required] - List of required property names for object properties
 * @property {boolean} [uniqueItems] - When true, ensures each item in the array is unique.
 *   Validation throws DataSchemaException.uniqueItems() if duplicates are found
 * @property {string} [pattern] - Regular expression pattern for string validation
 * @property {string[]} [enum] - Array of allowed values for enum validation
 * @property {number} [minLength] - Minimum length for string values
 * @property {number} [maxLength] - Maximum length for string values
 * @property {number} [minimum] - Minimum value for number values
 * @property {number} [maximum] - Maximum value for number values
 * @property {number} [exclusiveMinimum] - Exclusive minimum value for number values
 * @property {number} [exclusiveMaximum] - Exclusive maximum value for number values
 * @property {number} [multipleOf] - Value must be a multiple of this number
 * @property {number} [minItems] - Minimum number of items in an array
 * @property {number} [maxItems] - Maximum number of items in an array
 */

/**
 * @typedef {Object} EditorDataSchemaObject - Editor schema for object properties
 *
 * Defines the schema structure for the editor to render property inputs.
 * Used in packages/plugins/src/client/editor.js for form generation.
 *
 * @property {boolean} isPatterned - Indicates if property name is a regex pattern
 * @property {string} name - Name of the property
 * @property {string} type - Data type of the property
 * @property {EditorDataSchemaObject[]} [properties] - Nested object properties
 * @property {EditorDataSchema} [items] - Array items schema
 */

/**
 * @typedef {Object} EditorDataSchema - Editor schema for data structures
 *
 * Defines the complete schema structure for the editor to render forms.
 * Used in packages/plugins/src/client/editor.js for form generation.
 *
 * @property {EditorDataSchema} [items] - Array items schema
 * @property {EditorDataSchemaObject[]} [properties] - Object properties
 * @property {string} type - Root data type
 */

export {}
