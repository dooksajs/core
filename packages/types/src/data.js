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
 * @property {Object.<string, number>} [expandExclude] - Map of items to exclude from expansion (keyed by collection/id, value is index in expand array)
 * @property {boolean} [expandClone] - Return deep clones of expanded items
 * @property {string|string[]} [position] - Extract specific nested value using dot notation
 * @property {boolean} [clone] - Return deep clone of the main item value
 */

/**
 * @typedef {string | string[]} GetValueByQuery - Dot-notation path for nested data access
 *
 * Specifies a path to extract nested values from objects/arrays.
 * Used throughout the codebase for accessing nested properties.
 *
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
 * @property {boolean} [isCollection] - Flag indicating if the value is a collection result
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

export {}
