/**
 * @typedef {Object} DsData - Dooksa plugin data
 * @property {Boolean} private - Bind data to the scope of the plugin
 * @property {Function} default - Default value to be set
 * @property {DsSchema} schema - The data schema
 */

/**
 * @typedef {Object} DsSchema - Dooksa data schema
 * @property {'collection'|'object'|'array'|'string'|'number'|'boolean'} type - Data type
 * @property {DsSchemaItem} items
 * @property {Object.<string, DsSchemaObject>} properties
 * @property {Object.<string, DsSchemaObject>} patternProperties
 * @property {Function} suffixId - Collection suffix id
 * @property {Function} prefixId - Collection prefix id
 * @property {Function} defaultId - Default collection id
 */

/**
 * @typedef {Object} DsSchemaItem - Dooksa data schema
 * @property {'object'|'array'|'string'|'number'|'boolean'} type - Data type
 * @property {DsSchemaItem} items
 * @property {Object.<string, DsSchemaObject>} properties - The properties of an object
 * @property {Object.<string, DsSchemaObject>} patternProperties - The property name is equal regex pattern, e.g patternProperties: { '[0-9]': { } }
 */

/**
 * @typedef {Object} DsSchemaObject
 * @property {'object'|'array'|'string'|'number'|'boolean'} type - Data type
 * @property {DsSchemaItem} items
 * @property {Object.<string, DsSchemaObject>} properties - The properties of an object
 * @property {Object.<string, DsSchemaObject>} patternProperties - The property name is equal regex pattern, e.g patternProperties: { '[0-9]': { } }
 * @property {boolean} additionalProperties - Additional properties are allowed by default
 * @property {string[]} required - List of required properties that must exist and contain a value
 */

/**
 * @callback DsToken
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
 * @property {string} type - Category of element, e.g. <img> == 'image'
 * @property {Object} content - The getter and setters for the element
 * @property {DsComponentGet[]} content.get[] - The element getters
 * @property {DsComponentSet[]} content.set[] - The element setters
 */

/**
 * @typedef {Object} DsComponentGet
 * @property {'attribute'|'getter'} type - The type of getter by getAttribute or an element getter
 * @property {string} name - The name of the attribute
 * @property {string} contentProperty - The property name for the dsContent object to store the value
 */

/**
 * @typedef {Object} DsComponentSet
 * @property {'attribute'|'setter'} type - The type of setter by setAttribute or an element setter
 * @property {string} name - The name of the attribute
 * @property {string} contentProperty - The property name for the dsContent object to store the value
 */

/**
 * @typedef {Function} DsMethod
 * @param {Object.<string, *>} param - Public methods parameter requires a single object
 */

/**
 * @typedef {Object} DsMethodContext
 * @property {function} value - The contextual plugin function
 * @property {string[]} scope - A list of plugins to restrict the scope
 * @property {boolean} export - Export the method to the global app
 */

/**
 * @typedef {Function} DsSetup
 * @param {Object.<string, *>} options
 */

/**
 * Define a dooksa plugin
 * @typedef {Object} DsPluginData
 * @property {string} name - Name of plugin
 * @property {Object[]} dependencies - List of dependent plugins
 * @property {string} dependencies[].name - Name of dependent plugin
 * @property {number} dependencies[].version - version of dependent plugin
 * @property {number} version - Version of plugin
 * @property {DsSetup} setup - Setup function that is run on plugin initialisation
 * @property {Object.<string, DsData>} data - Data that the plugin will manage
 * @property {DsComponent[]} components
 * @property {Object.<string, (DsTokenGet|DsToken)>} tokens
 * @property {Object} methods
 * @property {Object.<string, (DsMethodContext|DsMethod)>} methods.context - Context methods are bound to each plugins scope unless specified otherwise
 * @property {Object.<string, DsMethod>} methods.public - Public methods are available within the plugins local scope and shared with other plugins via this.$method('dsExample/methodName')
 * @property {Object.<string, DsMethod>} methods.private - Private methods scope is bound to the plugin only
 */

export default {}