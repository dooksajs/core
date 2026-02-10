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
 * @property {HTMLElement} node - The DOM node to render the icon into
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

export {}
