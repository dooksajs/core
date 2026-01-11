/**
 * Utility functions for mock plugin creation
 * @import {TestContext} from 'node:test'
 */

/**
 * Converts an action name like "variable_getValue" to method name "variableGetValue"
 * @param {string} actionName - The action name to convert
 * @returns {string} The converted method name
 */
export function convertActionNameToMethodName (actionName) {
  const [namespace, method] = actionName.split('_')
  return namespace + method[0].toUpperCase() + method.slice(1)
}

/**
 * Creates a mock wrapper for action methods that injects context
 * @param {TestContext} context - Node.js TestContext for creating mocks
 * @param {Object} action - The action object containing the method to mock
 * @returns {Function} The mocked action method
 */
export function createActionMockWrapper (context, action) {
  return context.mock.fn((params, context = {}) => {
    return action.method(params, context)
  })
}

/**
 * Mocks all function exports from a plugin
 * @param {TestContext} context - Node.js TestContext for creating mocks
 * @param {Object} plugin - The plugin object to mock exports from
 * @param {Object} namedExports - The named exports object to populate
 * @param {Object} result - The result object to store method references
 */
export function mockPluginExports (context, plugin, namedExports, result) {
  // set plugin
  if (!namedExports[plugin.name]) {
    namedExports[plugin.name] = plugin
  }

  // set plugin methods
  for (const namedExport in plugin) {
    if (
      !namedExports[namedExport]
      && typeof plugin[namedExport] === 'function'
    ) {
      const mockPluginMethod = context.mock.fn(plugin[namedExport])
      namedExports[namedExport] = mockPluginMethod
      result.methods[namedExport] = mockPluginMethod
    }
  }
}

/**
 * Mocks action methods from a plugin and adds them to client exports
 * @param {TestContext} context - Node.js TestContext for creating mocks
 * @param {Object} plugin - The plugin object containing actions
 * @param {Object} namedExports - The plugin named exports object to populate
 * @param {Object} result - The result object to store method references
 * @param {Object} actionMethods - Optional object to store action method references
 * @returns {Object} The action methods object
 */
export function mockPluginActions (context, plugin, namedExports, result, actionMethods = {}) {
  if (plugin.actions) {
    for (let i = 0; i < plugin.actions.length; i++) {
      const action = plugin.actions[i]

      const mockActionMethod = createActionMockWrapper(context, action)
      const actionMethodName = convertActionNameToMethodName(action.name)

      namedExports[actionMethodName] = mockActionMethod
      actionMethods[action.name] = mockActionMethod
      result.actions[actionMethodName] = mockActionMethod
    }
  }
  return actionMethods
}
