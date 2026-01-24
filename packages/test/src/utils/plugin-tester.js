/**
 * Creates a Plugin Tester utility for a specific test suite.
 * Manages the lifecycle of hijacked plugins, ensuring circular dependencies
 * are handled correctly and cleaned up after tests.
 *
 * @param {import('node:test').TestContext} testContext - The context from `test((t) => ...)`
 * @returns {PluginTester} A utility to mock/spy plugins
 */
export function createPluginTester (testContext) {
  const activePlugins = new Set()
  const plugins = {}

  const register = (key, plugin, observable) => {
    activePlugins.add(plugin)
    plugins[key] = observable
    return observable
  }

  return {
    /**
     * Hijacks the plugin but executes the real logic.
     * The plugin behaves normally (return real values, update state),
     * but all calls are tracked in `.observe`.
     *
     * @param {string} alias - Alias for the test (e.g., 'auth', 'user')
     * @param {Object} plugin - The real plugin imported from core
     * @returns {Object} The observable instance
     */
    spy (alias, plugin) {
      const mock = plugin.createObservableInstance(testContext)

      return register(alias, plugin, mock)
    },

    /**
     * Hijacks the plugin and silences the real logic.
     * The real implementation is replaced with a no-op (returns undefined),
     * preventing side effects (network calls, DB writes, etc.).
     *
     * Custom return values can be provided using:
     * `tester.obs.key.observe.method.mock.mockImplementation(() => 'val')`
     *
     * @param {string} alias - Alias for the test
     * @param {Object} plugin - The real plugin
     * @returns {Object} The observable instance with silenced methods
     */
    mock (alias, plugin) {
      const mock = plugin.createObservableInstance(testContext)

      // Iterate over the .observe registry and replace implementations with No-Op
      for (const methodMock of Object.values(mock.observe)) {
        methodMock.mock.mockImplementation(() => {
        })
      }

      return register(alias, plugin, mock)
    },

    /**
     * Restores all hijacked plugins to their original state.
     * Call this in `test.afterEach()` to prevent test pollution.
     * This resets the internal `_impl` registry of the production plugins.
     *
     * @returns {void} No return value
     */
    restoreAll () {
      for (const plugin of activePlugins) {
        plugin.restore()
      }
      activePlugins.clear()
    },

    /**
     * Access registered observables by key.
     * @example
     * // Check call count for 'auth' plugin's 'login' action
     * assert.equal(tester.obs.auth.observe.login.mock.callCount(), 1)
     */
    plugins
  }
}

/**
 * @callback PluginTesterCallback
 * @param {string} alias - Alias for the test (e.g., 'auth', 'user')
 * @param {Object} plugin - The real plugin imported from core
 * @returns {Object} The observable instance
 */

/**
 * @typedef {Object} PluginTester
 * @property {PluginTesterCallback} spy - Track calls and execute real logic for a plugin
 * @property {PluginTesterCallback} mock - Track calls and silence real logic for a plugin
 * @property {Function} restoreAll - Restore all hijacked plugins to their original state
 * @property {Record<string, Object>} plugins - Map of active observables by alias
 */
