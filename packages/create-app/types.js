
/**
 * @import {DsPlugin, DsPluginStateExport} from '../create-plugin/types.js'
 */

/**
 * @callback UsePlugin
 * @param {DsPlugin} plugin
 */

/**
 * @typedef {Object} AppPlugin
 * @property {UsePlugin} use
 * @property {DsPlugin[]} plugins
 * @property {DsPluginStateExport} state
 * @property {Object.<string, Function>} actions
 * @property {AppSetup[]} setup
 */

/**
 * @typedef {Object} AppSetup
 * @property {string} name - Plugin name
 * @property {Function} setup - Plugin setup method
 */
