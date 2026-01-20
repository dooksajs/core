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
  const observables = {}

  /**
   * Internal helper to register an active observable
   */
  const register = (key, plugin, observable) => {
    activePlugins.add(plugin)
    observables[key] = observable
    return observable
  }

  return {
    /**
     * Hijacks the plugin but executes the real logic.
     * The plugin behaves normally (return real values, update state),
     * but all calls are tracked in `.observe`.
     *
     * @param {string} key - Alias for the test (e.g., 'auth', 'user')
     * @param {Object} plugin - The real plugin imported from core
     * @returns {Object} The observable instance
     */
    spy (key, plugin) {
      // createObservableInstance defaults to wrapping real logic in mock.fn()
      const obs = plugin.createObservableInstance(testContext)
      return register(key, plugin, obs)
    },

    /**
     * Hijacks the plugin and silences the real logic.
     * The real implementation is replaced with a no-op (returns undefined),
     * preventing side effects (network calls, DB writes, etc.).
     *
     * Custom return values can be provided using:
     * `tester.obs.key.observe.method.mock.mockImplementation(() => 'val')`
     *
     * @param {string} key - Alias for the test
     * @param {Object} plugin - The real plugin
     * @returns {Object} The observable instance with silenced methods
     */
    mock (key, plugin) {
      const obs = plugin.createObservableInstance(testContext)

      // Iterate over the .observe registry and silence implementations
      for (const methodMock of Object.values(obs.observe)) {
        methodMock.mock.mockImplementation(() => {
        })
      }

      return register(key, plugin, obs)
    },

    /**
     * Restores all hijacked plugins to their original state.
     * Call this in `test.afterEach()` to prevent test pollution.
     * This resets the internal `_impl` registry of the production plugins.
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
    obs: observables
  }
}

/**
 * @typedef {Object} PluginTester
 * @property {(key: string, plugin: Object) => Object} spy - Track calls, run real logic
 * @property {(key: string, plugin: Object) => Object} mock - Track calls, silence logic
 * @property {() => void} restoreAll - Reset all plugins
 * @property {Record<string, Object>} obs - Map of active observables
 */
