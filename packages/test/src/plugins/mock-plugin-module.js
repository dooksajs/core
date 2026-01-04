/**
 * @import {TestContext} from 'node:test'
 */

/**
 * @typedef {Object} MockPluginModule
 * @property {string} name - Plugin name
 * @property {any} plugin - Plugin
 * @property {string[]} methodNames - List of plugin method names
 */

/**
 * Mock a dooksa plugin module
 *
 * @template {string} Name
 * @param {TestContext} context - TextContext constructor
 * @param {Name} name - Name of plugin
 * @param {'client' | 'server'} [platform='client'] - Platform the plugin is intended to run on
 * @returns {Promise<MockPluginModule>}
 */
export function mockPluginModule (context, name, platform = 'client') {
  return new Promise((resolve, reject) => {
    import(`file:///home/tom/Projects/dooksa/packages/plugins/src/${platform}/${name}.js?${crypto.randomUUID().substring(30)}`)
      .then(({ default: plugin, ...namedExports }) => {
        const methodNames = []
        const mockMethods = {}

        // Handle named exports (like variableGetValue, variableSetValue)
        for (const exportName in namedExports) {
          if (typeof namedExports[exportName] === 'function') {
            methodNames.push(exportName)
            // Create a mock function for the named export
            const mockFn = context.mock.fn(namedExports[exportName])
            mockMethods[exportName] = mockFn
            // Replace the function with the mock
            namedExports[exportName] = mockFn
          }
        }

        // Handle plugin actions (like getValue, setValue)
        if (plugin?.actions) {
          for (const actionName in plugin.actions) {
            const action = plugin.actions[actionName]
            if (action && typeof action.method === 'function') {
              methodNames.push(actionName)
              // Create a mock function for the action method
              const mockFn = context.mock.fn(action.method)
              mockMethods[actionName] = mockFn
              // Replace the method with the mock
              action.method = mockFn
            }
          }
        }

        // Create the mock plugin with proper structure
        // Start with the original plugin
        const mockPlugin = { ...plugin }

        // Copy non-enumerable properties from plugin
        if (plugin.name) {
          mockPlugin.name = plugin.name
        }
        if (plugin.actions) {
          mockPlugin.actions = plugin.actions
        }

        // Add mock methods for named exports (these override the original functions)
        for (const exportName in mockMethods) {
          mockPlugin[exportName] = mockMethods[exportName]
        }

        // Add mock methods for action methods
        for (const methodName in mockMethods) {
          if (typeof mockPlugin[methodName] === 'function') {
            mockPlugin[methodName] = mockMethods[methodName]
          }
        }

        resolve({
          plugin: mockPlugin,
          methodNames,
          name: plugin.name || name
        })
      })
      .catch(error => reject(error))
  })
}
