import { api, state } from '#core'
import { createTestState } from './create-test-state.js'

/**
 * Sets up the plugin test environment (server, state, api)
 *
 * @param {Object} server - The test server instance
 * @param {Object} [options] - Configuration options
 * @param {Object} [options.serverOptions={}] - Options passed to server.start()
 * @param {Array} [options.clientPlugins=[]] - Additional client-side plugins
 * @param {number} [options.requestCacheExpire] - API cache expiration time
 * @returns {Promise<Object>} Object containing hostname
 */
export async function setupPluginTest (server, { serverOptions = {}, clientPlugins = [], requestCacheExpire } = {}) {
  // If serverOptions is passed as the first argument in legacy calls, handle it?
  // But we control the API.

  // api.spec.js passes (options, clientPlugins).
  // options contains requestCacheExpire.
  // So serverOptions IS options.

  const hostname = await server.start(serverOptions)
  const stateData = createTestState(clientPlugins)

  api.setup({
    hostname,
    requestCacheExpire
  })

  state.setup(stateData)

  return { hostname }
}

/**
 * Restores the plugin test environment
 *
 * @param {Object} [server] - The test server instance
 */
export async function restorePluginTest (server) {
  if (server) {
    await server.restore()
  }
  state.restore()
  api.restore()
}
