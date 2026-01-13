/**
 * @typedef {Object} DataSchema - Dooksa data schema
 * @property {('collection'|'object'|'array'|'string'|'number'|'boolean')} type - Data type
 * @property {DataSchemaItem} [items]
 * @property {Object.<string, DataSchemaObject>} [properties]
 * @property {Object.<string, DataSchemaObject>} [patternProperties]
 * @property {(Function|string)} [suffixId] - Collection suffix id
 * @property {(Function|string)} [prefixId] - Collection prefix id
 * @property {Function} [defaultId] - Default collection id
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

/**
 * @typedef {string | string[]} GetValueByQuery - Request to return a specific key value, dot notations are permitted
 */

/**
 * @typedef {Object} ComponentItem
 * @property {string} [id] - Component item id
 * @property {string} [rootId] - Root component item id
 * @property {string} [parentId] - Parent component item id
 * @property {string} [groupId] - Component group id
 * @property {Object} [component] - Component instance
 * @property {Object} [template] - Component template
 * @property {Node} [node] - Component node
 * @property {Object[]} [events] - Component events
 * @property {ComponentItem[]} [children]
 */

/**
 * @typedef {Object} EditorDataSchemaObject
 * @property {boolean} isPatterned - Is property name a regex pattern
 * @property {string} name - Name of property
 * @property {string} type - Data type
 * @property {EditorDataSchemaObject[]} [properties] - Object properties
 * @property {EditorDataSchema} [items] - Array items
 */

/**
 * @typedef {Object} EditorDataSchema
 * @property {EditorDataSchema} [items]
 * @property {EditorDataSchemaObject[]} [properties]
 * @property {string} type - Data type
 */

/**
 * @typedef {Object} EventEmit
 * @property {string} name - Name of the event to emit
 * @property {string} id - Event listener reference item ID
 * @property {Object} [context] - Context object containing data available to action handlers
 * @property {Object} [payload] - Data payload to pass to event handlers
 */

/**
 * @typedef {Object} FormOrderedValue - Represents an ordered form field value
 * @property {string} name - The name of the form field
 * @property {string} [value] - The value of the field (for non-nested fields)
 * @property {FormOrderedValue[]} [values] - Array of nested values (for fieldsets or multi-value fields)
 */

/**
 * @typedef {Object} FormFiles - Container for file attachments
 * @property {FormData} [files.data] - FormData object containing file attachments
 */

/**
 * @typedef {Object} IconQueueItem - Queue item for batch icon fetching
 * @property {string[]} icons - Array of icon IDs to fetch
 * @property {Object.<string, IconComponentData>} components - Components waiting for icons
 */

/**
 * @typedef {Object} IconData - Icon data from Iconify API
 * @property {Object} [icons] - Object containing icon data
 * @property {Object} [aliases] - Object containing icon aliases
 * @property {number} [icons.iconName.body] - SVG body content for an icon
 * @property {Object} [aliases.aliasName] - Alias definition with parent property
 */

/**
 * @typedef {Object} IconComponentData - Component data stored in icon queue
 * @property {Node} node - The DOM node to render the icon into
 * @property {string} iconId - The icon ID (without prefix)
 */

/**
 * @typedef {Object} IconStateSchema - Schema for icon state
 * @property {Object} items - Collection of cached icon SVG strings
 * @property {Object} aliases - Collection of icon aliases mapping to original icons
 */

/**
 * @typedef {Object} RegexPattern
 * @property {RegExp} pattern - The text of the regular expression. This can also be another RegExp object.
 * @property {string} flags - If specified, flags is a string that contains the flags to add. Alternatively, if a RegExp object is supplied for the pattern, the flags string will replace any of that object's flags (and lastIndex will be reset to 0).
 */

/**
 * @typedef {Object} StringReplace
 * @property {string} value - Target string
 * @property {string} pattern - Can be a string or regular expression
 * @property {string} replacement - String that will replace what matches the pattern
 */

/**
 * @typedef {Object} PageGetItemsByPath
 * @property {boolean} isEmpty
 * @property {string} [redirect]
 * @property {boolean} [isTemporary]
 * @property {string} [pageId]
 * @property {Object[]} [item]
 */

/**
 * @typedef {Object} VariableGetValue
 * @property {string} [scope] - Variable scope
 * @property {string} [prefixId] - ID prefix
 * @property {string} [suffixId] - ID suffix
 * @property {string} query - Query string
 */

/**
 * @typedef {Object} VariableSetValue
 * @property {string} [scope] - Variable scope
 * @property {Array} values - Values to set
 */

/**
 * @typedef {Object} ActionDispatchContext
 * @property {string} id - Action context ID
 * @property {string} [rootId] - Root context ID
 * @property {string} [parentId] - Parent context ID
 * @property {string} [groupId] - Group context ID
 */

/**
 * @typedef {Object} ActionBlock
 * @property {string} [method] - Action method name
 * @property {string} [key] - Block key
 * @property {string} [blockValue] - Block value reference
 * @property {string[]} [blockValues] - Multiple block value references
 * @property {string} [blockSequence] - Block sequence reference
 * @property {string} [dataType] - Data type
 * @property {boolean} [ifElse] - If else flag
 * @property {*} [value] - Direct value
 */

/**
 * @typedef {Object} DataDeleteValueResult
 * @property {boolean} inUse - Indicates if data value is in use
 * @property {boolean} deleted - Indicate if data was deleted
 */

/**
 * @typedef {Object} DataListenerHandler
 * @property {boolean} [force]
 * @property {number} [priority]
 * @property {Function} value
 */

/**
 * @typedef {Object} DataListenerCollection
 * @property {DataListenerHandler[]} all - Handlers that will fire on data instances
 * @property {DataListenerHandler[] | undefined} items - Handlers related to an specific data instance
 * @property {DataListenerHandler[] | undefined} priority - Handlers that will emit before "all" or "items" handlers
 */

/**
 * @typedef {Object} UpdateOptions - Options for array update operations
 * @property {'push'|'pull'|'pop'|'shift'|'unshift'|'splice'} method - Type of update method
 * @property {number} [startIndex] - Zero-based index at which to start changing the array (for splice)
 * @property {number} [deleteCount] - Number of elements to remove from start (for splice)
 * @property {(string[] & number[]) | (string[] | number[])} [position] - Update nested data within target
 */

/**
 * @typedef {Object} DataUpdateResult - Result from data update operations
 * @property {boolean} isValid - Indicates if the update was valid
 * @property {boolean} [complete] - Indicates if the operation is complete
 * @property {boolean} [isComplete] - Alternative property for completion status
 * @property {string} [id] - Document ID if applicable
 * @property {*} [item] - The updated item value
 * @property {*} [previous] - Previous item value
 * @property {Object} [metadata] - Metadata associated with the update
 * @property {*} [target] - The target data container
 */

/**
 * @typedef {Object} CollectionIdResult - Result from collection ID generation
 * @property {string} id - The full collection ID with affixes
 * @property {string} noAffixId - The ID without affixes
 */

/**
 * @typedef {Object} RelationInfo - Information for relationship management
 * @property {string} target - Target collection name
 * @property {string} id - Target document ID
 * @property {string} source - Source collection name
 */

/**
 * @typedef {Object} DataTarget - Container for data value and metadata
 * @property {*} _item - The actual data value
 * @property {Object} _metadata - Metadata associated with the data
 * @property {Object} [_previous] - Previous data state
 */

/**
 * @typedef {Object} DataValue - Complete data value with metadata and context
 * @property {string} collection - Collection name
 * @property {string} [id] - Document ID
 * @property {*} item - The data value
 * @property {Object} metadata - Metadata
 * @property {*} [previous] - Previous value
 * @property {DataValue[]} [expand] - Expanded related data
 * @property {Object} [expandIncluded] - Track expanded items to prevent duplicates
 * @property {boolean} [isEmpty] - Flag for empty results
 * @property {boolean} [isExpandEmpty] - Flag for empty expansion
 * @property {boolean} [isAffixEmpty] - Flag for affix lookup failure
 */

/**
 * @typedef {Object} DataMetadata - Metadata for data values
 * @property {number} [createdAt] - Creation timestamp
 * @property {number} [updatedAt] - Last update timestamp
 * @property {string} [userId] - User ID who created/modified the data
 */

/**
 * @typedef {Object} UpdateContext - Context for update operations
 * @property {string} collection - Collection name
 * @property {string} [id] - Document ID
 * @property {*} target - Target data container
 * @property {string} schemaPath - Current schema path
 */

/**
 * @typedef {Object} MergeResult - Result from merge operations
 * @property {boolean} isValid - Indicates if merge was valid
 * @property {boolean} complete - Indicates if operation is complete
 */
