import createApp from '../create-app-client.js'

/**
 * Pre-configured client application instance.
 *
 * This module exports a ready-to-use client application instance with all
 * default plugins and components already configured. It's the recommended
 * way to create client applications for most use cases.
 *
 * @type {Object}
 * @property {Function} usePlugin - Register a new plugin
 * @property {Function} useComponent - Register a new component
 * @property {Function} setup - Initialize and start the application
 *
 * @example
 * // Basic usage
 * import app from '@dooksa/create-app/build/client'
 *
 * // Add custom plugins
 * app.usePlugin(myPlugin)
 *
 * // Initialize
 * app.setup({
 *   options: { /* config *\/ },
 *   lazy: { 'auth': './plugins/auth.js' },
 *   loader: (file) => import(file)
 * })
 *
 * @example
 * // With custom components
 * import app from '@dooksa/create-app/build/client'
 * import customButton from './components/custom-button.js'
 *
 * app.useComponent(customButton)
 * app.setup({ options: {} })
 */
export default createApp()
