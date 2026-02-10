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
 * @property {string | RegExp} pattern - Pattern to search for (string or regular expression)
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

export {}
