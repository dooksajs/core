import createApp from '../create-app-server.js'

/**
 * Pre-configured server application instance.
 *
 * This module exports a ready-to-use server application instance with all
 * default server and client plugins already configured. It's the recommended
 * way to create server applications for most use cases.
 *
 * @type {Object}
 * @property {Function} usePlugin - Register a new server-side plugin
 * @property {Function} useClientPlugin - Register a new client-side plugin
 * @property {Function} useAction - Register a new action
 * @property {Function} setup - Initialize and start the server
 *
 * @example
 * // Basic usage
 * import app from '@dooksa/create-app/build/server'
 *
 * // Add custom plugins
 * app.usePlugin(databasePlugin)
 * app.useClientPlugin(authPlugin)
 *
 * // Add custom actions
 * app.useAction(customAction)
 *
 * // Initialize and start server
 * const server = app.setup({
 *   options: { port: 3000 }
 * })
 *
 * @example
 * // With custom plugin overrides
 * import app from '@dooksa/create-app/build/server'
 * import customServerPlugin from './plugins/custom-server.js'
 *
 * // Override default HTTP plugin
 * const serverApp = createApp({
 *   serverPlugins: {
 *     http: customHttpPlugin
 *   }
 * })
 *
 * serverApp.setup({ options: { port: 8080 } })
 */
export default createApp()
