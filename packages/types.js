/**
 * @typedef {Object} DataSchema - Dooksa data schema
 * @property {('collection'|'object'|'array'|'string'|'number'|'boolean')} type - Data type
 * @property {DataSchemaItem} [items]
 * @property {Object.<string, DataSchemaObject>} [properties]
 * @property {Object.<string, DataSchemaObject>} [patternProperties]
 * @property {(Function|string)} [suffixId] - Collection suffix id
 * @property {(Function|string)} [prefixId] - Collection prefix id
 * @property {(Function|string)} [defaultId] - Default collection id
 * @property {string[]} [required] - List of required properties that must exist and contain a value
 * @property {string} [relation] - Name of data collection the foreign key is related to
 * @property {boolean} [uniqueItems] - Ensure that each of the items in an array is unique
 * @property {boolean} [additionalProperties] - Additional properties are allowed by default
 */

/**
 * @typedef {Object} DataSchemaItem - Dooksa data schema
 * @property {('object'|'array'|'string'|'number'|'boolean')} type - Data type
 * @property {DataSchemaItem} [items]
 * @property {Object.<string, DataSchemaObject>} [properties] - The properties of an object
 * @property {Object.<string, DataSchemaObject>} [patternProperties] - The property name is equal regex pattern, e.g patternProperties: { '[0-9]': { } }
 * @property {string[]} [required] - List of required properties that must exist and contain a value
 * @property {string} [relation] - Name of data collection the foreign key is related to
 * @property {boolean} [uniqueItems] - Ensure that each of the items in an array is unique
 */

/**
 * @typedef {Object} DataSchemaObject
 * @property {('object'|'array'|'string'|'number'|'boolean')} type - Data type
 * @property {DataSchemaItem} [items]
 * @property {Object.<string, DataSchemaObject>} [properties] - The properties of an object
 * @property {Object.<string, DataSchemaObject>} [patternProperties] - The property name is equal regex pattern, e.g patternProperties: { '[0-9]': { } }
 * @property {boolean} [additionalProperties] - Additional properties are allowed by default
 * @property {string} [relation] - Name of data collection the foreign key is related to
 * @property {string[]} [required] - List of required properties that must exist and contain a value
 * @property {boolean} [uniqueItems] - Ensure that each of the items in an array is unique
 */

/**
 * @typedef {Function} Token
 * @param {Object.<string, *>} param - Parameter requires a single object
 */

/**
 * @typedef {Object} TokenGet
 * @property {Token} get - Parameter requires a single object
 */

/**
 * @typedef {Object} Component
 * @property {string} name - Name of HTMLElement
 * @property {Function} [lazy] - Function to import external resources e.g. () => import('iconify-icon')
 * @property {boolean} [isLazy] - DsPlugin constructor set if component is lazy loaded
 * @property {string} [type] - Category of element, e.g. <img> == 'image'
 * @property {(string[]|Component[])} [events] - The getter and setters for the element
 * @property {Object} [content] - The getter and setters for the element
 * @property {ComponentGet[]} [content.get] - The element getters
 * @property {ComponentSet[]} [content.set] - The element setters
 */

/**
 * @typedef {Object} ComponentEvent
 * @property {string} name
 * @property {boolean} [syncContent]
 */

/**
 * @typedef {Object} ComponentGet
 * @property {('attribute'|'getter')} type - The type of getter by getAttribute or an element getter
 * @property {string} name - The name of the attribute
 * @property {string} [property] - The property name for the dsContent object to store the value
 * @property {boolean} [token] - The property name for the dsContent object to store the value
 */

/**
 * @typedef {Object} ComponentSet
 * @property {('attribute'|'setter')} type - The type of setter by setAttribute or an element setter
 * @property {string} name - The name of the attribute
 * @property {string} [property] - The property name for the dsContent object to store the value
 * @property {boolean} [token] - The property name for the dsContent object to store the value
 */

/**
 * @callback DsSetup - Setup initialises the plugin
 * @param {Object.<string, *>} options - Options that change the default behavior of the plugin
 */

/**
 * @typedef {Object} DsPluginOptions - Setup options
 * @property {string} name - Plugin name related to the options
 * @property {boolean} [setupOnRequest] - Load plugin when the plugin is requested by dsManager
 * @property {string} [import] - Name of plugin file to dynamically import
 * @property {Object} [setup] - Setup options to pass to the dooksa plugin
 * @property {Object} [script] - This is to load an external plugin (refer to {@link https://bitbucket.org/dooksa/resource-loader/src/master/README.md resource-loader})
 */

/**
 * @typedef {Object} DataWhereProperty
 * @property {string} name - Property name
 * @property {'=='|'>'|'>='|'<'|'<='|'!='|'~'|'!~'} op - Operator
 * @property {string|number|boolean} value - Value to compare
 */

/**
 * @typedef {Object} DataWhere
 * @property {DataWhere[]} [and] - And
 * @property {DataWhere[]} [or] - And
 * @property {string} [name] - Property name
 * @property {'=='|'>'|'>='|'<'|'<='|'!='|'~'|'!~'} [op] - Operator
 * @property {string|number|boolean} [value] - Value to compare
 */

/**
 * @typedef {Object} SetDataOptions
 * @property {string} [id] - Document Id
 * @property {Object} [metadata] - Document metadata
 * @property {boolean} [stopPropagation] - Prevents further propagation of the update event
 * @property {boolean} [merge] - Merge target with source
 * @property {boolean} [replace] - Replace target with source
 * @property {Object} [update] - Update target with source
 * @property {(string[] & number[]) | (string[] | number[])} [update.position] - Update nested data within target with source
 * @property {'push'|'pull'|'pop'|'shift'|'unshift'|'splice'} [update.method] - Type of update method
 * @property {number} [update.startIndex] - Zero-based index at which to start changing the array
 * @property {number} [update.deleteCount] - An integer indicating the number of elements in the array to remove from start
 */

/**
 * Get data value query
 * @typedef {Object} GetDataOption
 * @property {boolean} [expand] - Expand all relational data
 * @property {Object} [expandExclude] - Exclude items from expanding
 * @property {boolean} [expandClone] - Expanded items returns a deep clone of the item value
 * @property {string|string[]} [position] - Return the value by key of the data value
 * @property {boolean} [clone] - Returns a deep clone of the item value
 */

/**
 * Get data value query
 * @typedef {Object} GetDataQuery
 * @property {string} name - Data collection name
 * @property {string} [id] - Data collection document id
 * @property {string} [prefixId] - Data collection document prefix
 * @property {string} [suffixId] - Data collection document suffix
 * @property {GetDataOption} [options] - Options
 */
