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
 * @callback Token - Token function for parameter validation
 * @param {Object.<string, *>} param - Parameter requires a single object
 * @returns {*} The validated parameter
 */

/**
 * @typedef {Object} TokenGet - Token getter configuration
 * @property {Token} get - Token function that validates and returns the parameter
 */

/**
 * @typedef {Object} Component - Dooksa component definition
 *
 * Defines a reusable UI component with properties, events, and content handlers.
 * Used extensively in packages/create-component/src/component.js for component creation
 * and management.
 *
 * @property {string} name - Name of the component/HTMLElement. Used as identifier
 * @property {Function} [lazy] - Function to import external resources dynamically.
 *   Example: () => import('iconify-icon')
 * @property {boolean} [isLazy] - Indicates if component is lazy loaded. Set by DsPlugin constructor
 * @property {string} [type] - Category of element (e.g., 'link', 'section', 'img', 'input', 'element').
 *   Used for component categorization and rendering logic
 * @property {(string[]|Component[])} [events] - Event handlers and listeners for the component.
 *   Can be array of event names or nested component definitions
 * @property {Object} [content] - Content management configuration with getters and setters
 * @property {ComponentGet[]} [content.get] - Content getters - methods to extract data from the component
 * @property {ComponentSet[]} [content.set] - Content setters - methods to inject data into the component
 */

/**
 * @typedef {Object} ComponentEvent - Event definition for a component
 *
 * Defines an event listener that triggers an action when a specific event occurs.
 * Used in packages/create-component/src/types.js for component event management.
 *
 * @property {string} on - Event type to listen for (e.g., 'click', 'change', 'submit')
 * @property {string} actionId - Unique identifier for the action to execute
 * @property {boolean} [syncContent] - When true, synchronizes component content before action execution
 */

/**
 * @typedef {Object} ComponentGet - Content getter definition for a component
 *
 * Defines how to extract data from a component element.
 * Used in packages/create-component/src/component.js for content management.
 *
 * @property {('attribute'|'getter')} type - The type of getter:
 *   'attribute' - Uses getAttribute() to retrieve element attribute
 *   'getter' - Uses element property getter to retrieve value
 * @property {string} name - The name of the attribute or property to retrieve
 * @property {string} [property] - The property name in the dsContent object to store the retrieved value
 * @property {boolean} [token] - When true, indicates the value should be treated as a token for replacement
 */

/**
 * @typedef {Object} ComponentSet - Content setter definition for a component
 *
 * Defines how to inject data into a component element.
 * Used in packages/create-component/src/component.js for content management.
 *
 * @property {('attribute'|'setter')} type - The type of setter:
 *   'attribute' - Uses setAttribute() to set element attribute
 *   'setter' - Uses element property setter to set value
 * @property {string} name - The name of the attribute or property to set
 * @property {string} [property] - The property name in the dsContent object to get the value from
 * @property {boolean} [token] - When true, indicates the value should be treated as a token for replacement
 */

/**
 * @callback DsSetup - Setup initialises the plugin
 *
 * Called when the plugin is loaded to initialize it with configuration.
 * Used in packages/create-plugin/src/create-plugin.js for plugin lifecycle.
 *
 * @param {Object.<string, *>} options - Options that change the default behavior of the plugin
 */

/**
 * @typedef {Object} DsPluginOptions - Setup options
 *
 * Defines configuration options for plugin creation and initialization.
 * Used in packages/create-plugin/src/create-plugin.js for plugin setup.
 *
 * @property {string} name - Plugin name related to the options
 * @property {boolean} [setupOnRequest] - Load plugin when the plugin is requested by dsManager
 * @property {string} [import] - Name of plugin file to dynamically import
 * @property {Object} [setup] - Setup options to pass to the dooksa plugin
 * @property {Object} [script] - This is to load an external plugin (refer to {@link https://bitbucket.org/dooksa/resource-loader/src/master/README.md resource-loader})
 */

/**
 * @typedef {Object} DataWhereProperty - Single filter condition for data queries
 *
 * Defines a comparison condition used in data filtering operations.
 * Used in packages/plugins/src/core/state.js for data filtering.
 *
 * @property {string} name - Property name to filter on (supports dot notation for nested properties)
 * @property {'=='|'>'|'>='|'<'|'<='|'!='|'~'|'!~'} op - Comparison operator:
 *   '==' - Equal to
 *   '!=' - Not equal to
 *   '>' - Greater than
 *   '>=' - Greater than or equal to
 *   '<' - Less than
 *   '<=' - Less than or equal to
 *   '~' - Contains (string match)
 *   '!~' - Does not contain
 * @property {string|number|boolean} value - Value to compare against
 */

/**
 * @typedef {Object} DataWhere - Complex filter condition with logical operators
 *
 * Defines hierarchical filtering conditions for data queries.
 * Used in packages/plugins/src/core/state.js for complex filtering.
 *
 * @property {DataWhere[]} [and] - Array of conditions that must ALL be true (logical AND)
 * @property {DataWhere[]} [or] - Array of conditions where ANY can be true (logical OR)
 * @property {string} [name] - Property name for simple conditions
 * @property {'=='|'>'|'>='|'<'|'<='|'!='|'~'|'!~'} [op] - Operator for simple conditions
 * @property {string|number|boolean} [value] - Value for simple conditions
 */

/**
 * @typedef {Object} SetDataOptions - Options for setting data in state
 *
 * Controls how data is inserted or updated in the state management system.
 * Used extensively in packages/plugins/src/core/state.js for data modification.
 *
 * @property {string} [id] - Document ID for collection items
 * @property {Object} [metadata] - Metadata to associate with the data
 * @property {boolean} [stopPropagation] - Prevents update event propagation to listeners
 * @property {boolean} [merge] - Merge new data with existing data (shallow merge)
 * @property {boolean} [replace] - Completely replace existing data with new data
 * @property {Object} [update] - Configuration for nested array/object updates
 * @property {(string[] & number[]) | (string[] | number[])} [update.position] - Path to nested data
 * @property {'push'|'pull'|'pop'|'shift'|'unshift'|'splice'} [update.method] - Array operation method
 * @property {number} [update.startIndex] - Start index for splice operations
 * @property {number} [update.deleteCount] - Number of elements to delete for splice
 * @property {string} [prefixId] - Prefix to add to the ID
 * @property {string} [suffixId] - Suffix to add to the ID
 */

/**
 * @typedef {Object} GetDataOption - Options for data retrieval queries
 *
 * Controls how data is retrieved from the state management system.
 * Used in packages/plugins/src/core/state.js for data queries.
 *
 * @property {boolean} [expand] - Expand all relational data (foreign key relationships)
 * @property {Object} [expandExclude] - Map of items to exclude from expansion
 * @property {boolean} [expandClone] - Return deep clones of expanded items
 * @property {string|string[]} [position] - Extract specific nested value using dot notation
 * @property {boolean} [clone] - Return deep clone of the main item value
 */

/**
 * @typedef {Object} GetDataQuery - Complete query for retrieving data
 *
 * Defines a complete data retrieval request with collection, ID, and options.
 * Used in packages/plugins/src/core/state.js for state queries.
 *
 * @property {string} name - Data collection name
 * @property {string} [id] - Document ID within collection
 * @property {string} [prefixId] - Prefix for ID lookup
 * @property {string} [suffixId] - Suffix for ID lookup
 * @property {GetDataOption} [options] - Query options
 */

/**
 * @typedef {string | string[]} GetValueByQuery - Dot-notation path for nested data access
 *
 * Specifies a path to extract nested values from objects/arrays.
 * Used throughout the codebase for accessing nested properties.
 *
 */

/**
 * @typedef {Object} ComponentItem - Component instance data
 *
 * Represents a rendered component instance with hierarchy and runtime state.
 * Used in packages/create-component/src/types.js for component instance management.
 *
 * @property {string} [id] - Unique identifier for the component instance
 * @property {string} [rootId] - Root component item ID (top-level template)
 * @property {string} [parentId] - Parent component item ID for hierarchical structure
 * @property {string} [groupId] - Component group ID for grouping related components
 * @property {Object} [component] - Component instance data with runtime state
 * @property {Object} [template] - Original component template definition
 * @property {Node} [node] - DOM node reference for the component element
 * @property {Object[]} [events] - Event listeners attached to this component instance
 * @property {ComponentItem[]} [children] - Child component instances for nested components
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

/**
 * @typedef {Object} EventEmit - Event emission configuration
 *
 * Defines parameters for emitting events through the event system.
 * Used in packages/plugins/src/core/event.js for event handling.
 *
 * @property {string} name - Name of the event to emit
 * @property {string} id - Event listener reference item ID
 * @property {Object} [context] - Context object containing data available to action handlers
 * @property {Object} [payload] - Data payload to pass to event handlers
 */

/**
 * @typedef {Object} FormOrderedValue - Represents an ordered form field value
 *
 * Defines a hierarchical structure for form field values with nesting support.
 * Used in form processing and validation throughout the application.
 *
 * @property {string} name - The name of the form field
 * @property {string} [value] - The value of the field (for non-nested fields)
 * @property {FormOrderedValue[]} [values] - Array of nested values (for fieldsets or multi-value fields)
 */

/**
 * @typedef {Object} FormFiles - Container for file attachments
 *
 * Wraps file data in a FormData object for upload operations.
 * Used in form submission and file handling.
 *
 * @property {FormData} [files.data] - FormData object containing file attachments
 */

/**
 * @typedef {Object} IconQueueItem - Queue item for batch icon fetching
 *
 * Represents a batch request for fetching icons from Iconify API.
 * Used in packages/plugins/src/client/icon.js for icon management.
 *
 * @property {string[]} icons - Array of icon IDs to fetch from Iconify
 * @property {Object.<string, IconComponentData>} components - Components waiting for icons (keyed by component ID)
 */

/**
 * @typedef {Object} IconData - Icon data from Iconify API
 *
 * Contains icon SVG data and aliases from the Iconify API response.
 * Used in packages/plugins/src/client/icon.js for icon rendering.
 *
 * @property {Object} [icons] - Object containing icon data (keyed by icon name)
 * @property {Object} [aliases] - Object containing icon aliases (keyed by alias name)
 * @property {number} [icons.iconName.body] - SVG body content for an icon
 * @property {Object} [aliases.aliasName] - Alias definition with parent property
 */

/**
 * @typedef {Object} IconComponentData - Component data stored in icon queue
 *
 * Contains the DOM node and icon ID for icon rendering.
 * Used in packages/plugins/src/client/icon.js for icon queue management.
 *
 * @property {Node} node - The DOM node to render the icon into
 * @property {string} iconId - The icon ID (without prefix)
 */

/**
 * @typedef {Object} IconStateSchema - Schema for icon state
 *
 * Defines the structure for caching icon data in the state.
 * Used in packages/plugins/src/client/icon.js for icon state management.
 *
 * @property {Object} items - Collection of cached icon SVG strings (keyed by icon ID)
 * @property {Object} aliases - Collection of icon aliases mapping to original icons
 */

/**
 * @typedef {Object} RegexPattern - Regular expression pattern with flags
 *
 * Defines a regular expression for pattern matching operations.
 * Used in packages/create-action/types/index.js for string operations.
 *
 * @property {RegExp} pattern - The text of the regular expression.
 *   This can also be another RegExp object.
 * @property {string} [flags] - Flags to add to the regex (e.g., 'i', 'g', 'm').
 *   If a RegExp object is supplied for the pattern, the flags string will replace
 *   any of that object's flags (and lastIndex will be reset to 0).
 */

/**
 * @typedef {Object} StringReplace - String replacement configuration
 *
 * Defines parameters for string replacement operations.
 * Used in packages/create-action/types/index.js for string manipulation.
 *
 * @property {string} value - Target string to search within
 * @property {string} pattern - Pattern to search for (string or regular expression)
 * @property {string} replacement - String that will replace what matches the pattern
 */

/**
 * @typedef {Object} PageGetItemsByPath - Result from page path lookup
 *
 * Contains page items and redirect information for route resolution.
 * Used in packages/plugins/src/server/page.js for page routing.
 *
 * @property {boolean} isEmpty - Flag indicating no items were found
 * @property {string} [redirect] - Redirect path if page not found
 * @property {boolean} [isTemporary] - Whether redirect is temporary (302) or permanent (307)
 * @property {string} [pageId] - Page ID if found
 * @property {Object[]} [item] - Array of page component items
 */

/**
 * @typedef {Object} VariableGetValue - Configuration for retrieving variable values
 *
 * Defines parameters for accessing variables from different scopes.
 * Used in packages/create-action/types/index.js for variable operations.
 *
 * @property {string} [scope] - Variable scope (e.g., 'user', 'global', 'local')
 * @property {string} [prefixId] - ID prefix for variable lookup
 * @property {string} [suffixId] - ID suffix for variable lookup
 * @property {string} query - Query string for variable access (supports dot notation)
 */

/**
 * @typedef {Object} VariableSetValue - Configuration for setting variable values
 *
 * Defines parameters for storing variables in different scopes.
 * Used in packages/create-action/types/index.js for variable operations.
 *
 * @property {string} [scope] - Variable scope (e.g., 'user', 'global', 'local')
 * @property {Array} values - Array of value objects to set
 */

/**
 * @typedef {Object} ActionDispatchContext - Context for action execution
 *
 * Defines the execution context for actions, including component hierarchy.
 * Used in packages/create-action/types/index.js for action compilation.
 *
 * @property {string} id - Action context ID (unique identifier)
 * @property {string} [rootId] - Root context ID (top-level template)
 * @property {string} [parentId] - Parent context ID for hierarchical structure
 * @property {string} [groupId] - Group context ID for grouping related actions
 */

/**
 * @typedef {Object} ActionBlock - Compiled action block
 *
 * Represents a single executable unit in an action sequence.
 * Used in packages/create-action/types/index.js for action compilation.
 *
 * @property {string} [method] - Action method name to execute
 * @property {string} [key] - Block identifier for reference
 * @property {string} [blockValue] - Single child block reference
 * @property {string[]} [blockValues] - Multiple child block references
 * @property {string} [blockSequence] - Associated block sequence ID
 * @property {string} [dataType] - Data type ('array', 'object', 'string', 'number', 'boolean')
 * @property {boolean} [ifElse] - Flag indicating conditional block
 * @property {*} [value] - Direct primitive value
 */

/**
 * @typedef {Object} DataDeleteValueResult - Result from data deletion operations
 *
 * Indicates the outcome of a delete operation and whether the data can be safely removed.
 * Used in packages/plugins/src/core/state.js for data deletion.
 *
 * @property {boolean} inUse - Indicates if data value is referenced by other data
 * @property {boolean} deleted - Indicates if data was successfully deleted
 */

/**
 * @typedef {Object} DataListenerHandler - Event handler for data changes
 *
 * Defines a callback function that responds to data updates or deletions.
 * Used in packages/plugins/src/core/state.js for event management.
 *
 * @property {boolean} [force] - When true, fires even if event propagation is stopped
 * @property {number} [priority] - Handler priority (lower numbers execute first)
 * @property {Function} value - The callback function to execute
 */

/**
 * @typedef {Object} DataListenerCollection - Collection of event handlers
 *
 * Groups handlers by priority and scope for efficient event dispatching.
 * Used in packages/plugins/src/core/state.js for listener management.
 *
 * @property {DataListenerHandler[]} all - Handlers that fire on all data instances
 * @property {DataListenerHandler[] | undefined} items - Handlers for specific data instances
 * @property {DataListenerHandler[] | undefined} priority - Priority handlers (execute before others)
 */

/**
 * @typedef {Object} UpdateOptions - Options for array update operations
 *
 * Defines parameters for array manipulation operations.
 * Used in packages/plugins/src/core/state.js for array updates.
 *
 * @property {'push'|'pull'|'pop'|'shift'|'unshift'|'splice'} method - Array operation method
 * @property {number} [startIndex] - Start index for splice operations
 * @property {number} [deleteCount] - Number of elements to remove for splice
 * @property {(string[] & number[]) | (string[] | number[])} [position] - Path to nested array
 */

/**
 * @typedef {Object} DataUpdateResult - Result from data update operations
 *
 * Contains the outcome of a data modification operation.
 * Used in packages/plugins/src/core/state.js for update results.
 *
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
 *
 * @property {string} id - The full collection ID with prefix/suffix affixes
 * @property {string} noAffixId - The ID without any affixes
 */

/**
 * @typedef {Object} RelationInfo - Information for relationship management
 *
 * Defines a relationship between data items for cascade operations.
 * Used in packages/plugins/src/core/state.js for relationship tracking.
 *
 * @property {string} target - Target collection name
 * @property {string} id - Target document ID
 * @property {string} source - Source collection name
 */

/**
 * @typedef {Object} DataTarget - Internal container for data value and metadata
 *
 * Used internally by the state management system to store data with metadata.
 * Created and managed in packages/plugins/src/core/state.js.
 *
 * @property {*} _item - The actual data value stored in the state
 * @property {Object} _metadata - Metadata associated with the data (timestamps, user IDs, etc.)
 * @property {Object} [_previous] - Previous data state for change tracking and rollback
 */

/**
 * @template T
 * @typedef {Object} DataValue - Complete data value with metadata and context
 *
 * Represents a data value returned from state queries with full context.
 * Used extensively in packages/plugins/src/core/state.js for data retrieval
 * and packages/plugins/src/utils/data-value.js for creation.
 *
 * @property {string} collection - Name of the data collection
 * @property {string} [id] - Document ID within the collection
 * @property {T} item - The actual data value
 * @property {Object} metadata - Metadata (timestamps, user IDs, etc.)
 * @property {T} [previous] - Previous value for change tracking
 * @property {DataValue<DataValue<*>>[]} [expand] - Expanded related data (when expand option is used)
 * @property {Object} [expandIncluded] - Track expanded items to prevent duplicates/infinite loops
 * @property {boolean} [isEmpty] - Flag indicating no data was found
 * @property {boolean} [isExpandEmpty] - Flag indicating expanded data is empty
 * @property {boolean} [isAffixEmpty] - Flag indicating affix lookup failed
 */

/**
 * @typedef {Object} DataMetadata - Metadata for data values
 *
 * Contains temporal and ownership information for data items.
 * Automatically managed by the state management system.
 *
 * @property {number} [createdAt] - Creation timestamp (milliseconds since epoch)
 * @property {number} [updatedAt] - Last update timestamp (milliseconds since epoch)
 * @property {string} [userId] - User ID who created/modified the data
 */

/**
 * @typedef {Object} UpdateContext - Context for update operations
 *
 * Provides context information during data update operations.
 * Used in packages/plugins/src/core/state.js for update processing.
 *
 * @property {string} collection - Collection name
 * @property {string} [id] - Document ID
 * @property {*} target - Target data container
 * @property {string} schemaPath - Current schema path
 */

/**
 * @typedef {Object} MergeResult - Result from merge operations
 *
 * Indicates the outcome of a merge operation.
 * Used in packages/plugins/src/core/state.js for merge results.
 *
 * @property {boolean} isValid - Indicates if merge was valid
 * @property {boolean} complete - Indicates if operation is complete
 */
