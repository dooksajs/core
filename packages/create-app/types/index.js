/**
 * @import {DsPlugin, DsPluginStateExport} from '../../create-plugin/types.js'
 */

/**
 * @callback UsePlugin
 * @description Adds a plugin to the application's plugin manager.
 * @param {DsPlugin} plugin - The plugin instance to register
 * @returns {void}
 * @example
 * const pluginManager = appendPlugin()
 * pluginManager.use(myCustomPlugin)
 */

/**
 * @typedef {Object} AppPlugin
 * @description Core plugin management interface used by both client and server applications.
 * Provides methods to register plugins, manage state, actions, and setup procedures.
 * @property {UsePlugin} use - Function to add plugins to the application
 * @property {DsPlugin[]} plugins - Array of registered plugin instances
 * @property {DsPluginStateExport} state - Plugin state management with defaults, items, names, values, and schema
 * @property {Object.<string, Function>} actions - Map of registered action names to their methods
 * @property {AppSetup[]} setup - Queue of plugins pending setup execution
 */

/**
 * @typedef {Object} AppSetup
 * @description Represents a plugin that needs to be initialized with its setup function.
 * @property {string} name - The unique name identifier of the plugin
 * @property {Function} setup - The setup method to initialize the plugin with its configuration
 */

/**
 * @typedef {Object} AppClientPlugin
 * @description Client-side plugin manager that handles plugin registration and action collection.
 * Used specifically in client applications to manage plugins and their associated actions.
 * @property {Function} use - Method to register a client plugin
 * @property {Array<{name: string, metadata: Object}>} metadata - Collection of plugin metadata
 * @property {Array<Object>} actions - Collection of all actions from registered plugins
 */

/**
 * @typedef {Object} AppAction
 * @description Action management interface for registering and retrieving application actions.
 * @property {Function} use - Method to register a new action
 * @property {Array<Object>} items - Read-only getter for all registered actions
 */

/**
 * @typedef {Object} AppComponent
 * @description Component management interface for registering and retrieving UI components.
 * @property {Function} use - Method to register a new component
 * @property {Object.<string, Object>} items - Map of component IDs to component definitions
 */

/**
 * @typedef {Object} ServerPlugins
 * @description Configuration object for server-side plugin overrides.
 * Allows customization of core server plugins during app initialization.
 * @property {DsPlugin} [state] - State management plugin override
 * @property {DsPlugin} [middleware] - Middleware plugin override
 * @property {DsPlugin} [http] - HTTP server plugin override
 * @property {DsPlugin} [metadata] - Metadata plugin override
 * @property {DsPlugin} [user] - User management plugin override
 * @property {DsPlugin} [database] - Database plugin override
 * @property {DsPlugin} [action] - Action plugin override
 * @property {DsPlugin} [component] - Component plugin override
 * @property {DsPlugin} [event] - Event plugin override
 * @property {DsPlugin} [page] - Page plugin override
 * @property {DsPlugin} [theme] - Theme plugin override
 */

/**
 * @typedef {Object} ClientPlugins
 * @description Configuration object for client-side plugin overrides.
 * Allows customization of core client plugins during app initialization.
 * @property {DsPlugin} [state] - State management plugin override
 * @property {DsPlugin} [metadata] - Metadata plugin override
 * @property {DsPlugin} [api] - API plugin override
 * @property {DsPlugin} [operator] - Operator plugin override
 * @property {DsPlugin} [action] - Action plugin override
 * @property {DsPlugin} [variable] - Variable plugin override
 * @property {DsPlugin} [component] - Component plugin override
 * @property {DsPlugin} [regex] - Regex plugin override
 * @property {DsPlugin} [editor] - Editor plugin override
 * @property {DsPlugin} [list] - List plugin override
 * @property {DsPlugin} [event] - Event plugin override
 * @property {DsPlugin} [token] - Token plugin override
 * @property {DsPlugin} [icon] - Icon plugin override
 * @property {DsPlugin} [query] - Query plugin override
 * @property {DsPlugin} [route] - Route plugin override
 * @property {DsPlugin} [form] - Form plugin override
 * @property {DsPlugin} [string] - String plugin override
 * @property {DsPlugin} [page] - Page plugin override
 */

/**
 * @typedef {Object} AppOptions
 * @description Configuration options for Dooksa application initialization.
 * @property {Object} [options={}] - Application configuration options
 * @property {Object} [lazy={}] - Lazy-loaded plugin definitions
 * @property {Function} [loader] - Custom plugin loader function
 */

/**
 * @typedef {Object} PluginMetadata
 * @description Metadata structure for plugin identification and versioning.
 * @property {string} name - Plugin name identifier
 * @property {Object} metadata - Plugin metadata including version, author, etc.
 */

/**
 * @typedef {Object} Action
 * @description Action definition structure used throughout the application.
 * @property {string} id - Unique action identifier
 * @property {string} name - Action name
 * @property {Function} method - Action implementation function
 */

/**
 * @typedef {Object} Component
 * @description Component definition structure for UI components.
 * @property {string} id - Unique component identifier
 * @property {string} name - Component name
 * @property {Object} options - Component configuration options
 */
