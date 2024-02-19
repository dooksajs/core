/**
 * @typedef {Object} DsData - Dooksa plugin data
 * @property {Boolean} [private] - Bind data to the scope of the plugin
 * @property {(Function|string)} [default] - Default value to be set
 * @property {DsSchema} [schema] - The data schema
 * @property {string} [description] - Description of data set
 */

/**
 * @typedef {Object} DsSchema - Dooksa data schema
 * @property {('collection'|'object'|'array'|'string'|'number'|'boolean')} type - Data type
 * @property {DsSchemaItem} [items]
 * @property {Object.<string, DsSchemaObject>} [properties]
 * @property {Object.<string, DsSchemaObject>} [patternProperties]
 * @property {(Function|string)} [suffixId] - Collection suffix id
 * @property {(Function|string)} [prefixId] - Collection prefix id
 * @property {(Function|string)} [defaultId] - Default collection id
 * @property {string} [relation] - Name of data collection the foreign key is related to
 * @property {boolean} [uniqueItems] - Ensure that each of the items in an array is unique
 */

/**
 * @typedef {Object} DsSchemaItem - Dooksa data schema
 * @property {('object'|'array'|'string'|'number'|'boolean')} type - Data type
 * @property {DsSchemaItem} [items]
 * @property {Object.<string, DsSchemaObject>} [properties] - The properties of an object
 * @property {Object.<string, DsSchemaObject>} [patternProperties] - The property name is equal regex pattern, e.g patternProperties: { '[0-9]': { } }
 * @property {string} [relation] - Name of data collection the foreign key is related to
 * @property {boolean} [uniqueItems] - Ensure that each of the items in an array is unique
 */

/**
 * @typedef {Object} DsSchemaObject
 * @property {('object'|'array'|'string'|'number'|'boolean')} type - Data type
 * @property {DsSchemaItem} [items]
 * @property {Object.<string, DsSchemaObject>} [properties] - The properties of an object
 * @property {Object.<string, DsSchemaObject>} [patternProperties] - The property name is equal regex pattern, e.g patternProperties: { '[0-9]': { } }
 * @property {boolean} [additionalProperties] - Additional properties are allowed by default
 * @property {string} [relation] - Name of data collection the foreign key is related to
 * @property {string[]} [required] - List of required properties that must exist and contain a value
 * @property {boolean} [uniqueItems] - Ensure that each of the items in an array is unique
 */

/**
 * @typedef {Function} DsToken
 * @param {Object.<string, *>} param - Parameter requires a single object
 */

/**
 * @typedef {Object} DsTokenGet
 * @property {DsToken} get - Parameter requires a single object
 */

/**
 * @typedef {Object} DsComponent
 * @property {string} name - Name of HTMLElement
 * @property {Function} [lazy] - Function to import external resources e.g. () => import('iconify-icon')
 * @property {boolean} [isLazy] - DsPlugin constructor set if component is lazy loaded
 * @property {string} [type] - Category of element, e.g. <img> == 'image'
 * @property {(string[]|DsComponentEvent[])} [events] - The getter and setters for the element
 * @property {Object} [content] - The getter and setters for the element
 * @property {DsComponentGet[]} [content.get] - The element getters
 * @property {DsComponentSet[]} [content.set] - The element setters
 */

/**
 * @typedef {Object} DsComponentEvent
 * @property {string} name
 * @property {boolean} [syncContent]
 */

/**
 * @typedef {Object} DsComponentGet
 * @property {('attribute'|'getter')} type - The type of getter by getAttribute or an element getter
 * @property {string} name - The name of the attribute
 * @property {string} [property] - The property name for the dsContent object to store the value
 * @property {boolean} [token] - The property name for the dsContent object to store the value
 */

/**
 * @typedef {Object} DsComponentSet
 * @property {('attribute'|'setter')} type - The type of setter by setAttribute or an element setter
 * @property {string} name - The name of the attribute
 * @property {string} [property] - The property name for the dsContent object to store the value
 * @property {boolean} [token] - The property name for the dsContent object to store the value
 */

/**
 * @callback DsMethod
 * @param {Object.<string, *>} param - Public methods parameter requires a single object
 */

/**
 * @typedef {Object} DsMethodContext
 * @property {DsMethod} value - The contextual plugin function
 * @property {string[]} scope - A list of plugins to restrict the scope
 * @property {boolean} export - Export the method to the global app
 */

/**
 * @callback DsSetup - Setup initialises the plugin
 * @param {Object.<string, *>} options - Options that change the default behavior of the plugin
 */

/**
 * Define a dooksa plugin
 * @typedef {Object} DsPluginData
 * @property {string} name - Name of plugin
 * @property {Object[]} [dependencies] - List of dependent plugins
 * @property {string} dependencies[].name - Name of dependent plugin
 * @property {number} dependencies[].version - version of dependent plugin
 * @property {number} version - Version of plugin
 * @property {DsSetup} [setup] - Setup function that is run on plugin initialisation
 * @property {Object.<string, DsData>} [data] - Data that the plugin will manage
 * @property {DsComponent[]} [components]
 * @property {Object.<string, (DsToken|DsTokenGet)>} [tokens]
 * @property {Object} [methods]
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
 * @typedef {Object} DsDataWhereProperty
 * @property {string} name - Property name
 * @property {'=='|'>'|'>='|'<'|'<='|'!='|'~'|'!~'} op - Operator
 * @property {string|number|boolean} value - Value to compare
 */

/**
 * @typedef {Object} DsDataWhere
 * @property {DsDataWhere[]} [and] - And
 * @property {DsDataWhere[]} [or] - And
 * @property {string} [name] - Property name
 * @property {'=='|'>'|'>='|'<'|'<='|'!='|'~'|'!~'} [op] - Operator
 * @property {string|number|boolean} [value] - Value to compare
 */

// * @property {Object.<string, (DsMethodContext|DsMethod)>} [methods.context] - Context methods are bound to each plugins scope unless specified otherwise
// * @property {Object.<string, DsMethod>} [methods.public] - Public methods are available within the plugins local scope and shared with other plugins via this.$method('dsExample/methodName')
// * @property {Object.<string, Function>} [methods.private] - Private methods scope is bound to the plugin only

export default {}
