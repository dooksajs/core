
/**
 * @import {Plugin, PluginSchemaGetter} from '../create-plugin/types.js'
 */

/**
 * @callback UsePlugin
 * @param {Plugin} plugin
 */

/**
 * @typedef {Object} AppPlugin
 * @property {UsePlugin} use
 * @property {Plugin[]} plugins
 * @property {PluginSchemaGetter} schema
 * @property {Object.<string, Function>} actions
 * @property {AppSetup[]} setup
 */

/**
 * @typedef {Object} AppSetup
 * @property {string} name - Plugin name
 * @property {Function} setup - Plugin setup method
 */
