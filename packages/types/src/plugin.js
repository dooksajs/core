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

export {}
