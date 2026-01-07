/**
 * @callback MockActionCallback
 * @description The mock action method returned by mockActionMethod
 * @param {string} actionName - The name of the action to execute (e.g., 'setValue', 'variable_setValue')
 * @param {any} [param] - The parameter to pass to the action method
 * @param {Object} [context] - The execution context for the action
 * @param {Object} [callback={}] - Optional callback handlers
 * @param {Function} [callback.onSuccess] - Called with the result on successful execution
 * @param {Function} [callback.onError] - Called with an Error on any failure
 * @returns {void} Returns nothing, results are handled via callbacks
 */

/**
 * Creates a mock action method handler for testing purposes.
 *
 * This factory function returns a mock action method that can resolve action names
 * (including namespaced actions like 'variable_setValue') to their corresponding
 * implementations and execute them with proper error and success handling.
 *
 * @param {Object} result - The mock result object containing plugin modules and state
 * @param {Object} result.modules - Additional mocked plugin modules
 * @param {Object} result.plugin - The main mocked plugin instance
 * @returns {MockActionCallback} A mock action method function
 *
 * @example
 * // Basic usage
 * const mock = { modules: {}, plugin: { myAction: (x) => x * 2 } }
 * const actionMethod = mockActionMethod(mock)
 *
 * actionMethod('myAction', 5, {}, {
 *   onSuccess: (result) => console.log(result), // 10
 *   onError: (error) => console.error(error)
 * })
 *
 * @example
 * // Namespaced action
 * const mock = {
 *   modules: {
 *     variable: {
 *       setValue: (value) => ({ value })
 *     }
 *   }
 * }
 * const actionMethod = mockActionMethod(mock)
 *
 * actionMethod('variable_setValue', 'test', {}, {
 *   onSuccess: (result) => console.log(result), // { value: 'test' }
 *   onError: (error) => console.error(error)
 * })
 *
 * @example
 * // Async action with error
 * const mock = {
 *   plugin: {
 *     asyncAction: async () => {
 *       throw new Error('Async failure')
 *     }
 *   }
 * }
 * const actionMethod = mockActionMethod(mock)
 *
 * actionMethod('asyncAction', null, {}, {
 *   onSuccess: (result) => console.log(result),
 *   onError: (error) => console.error(error.message) // 'Async failure'
 * })
 */
export function mockActionMethod (result) {
  return (actionName, param, context, callback = {}) => {
    // Find the action method in the mocked modules or main plugin
    let actionMethod = result.modules[actionName] || result.plugin[actionName]

    // Also check if it's a namespaced action like 'variable_setValue'
    if (!actionMethod && actionName.includes('_')) {
      const [namespace, method] = actionName.split('_')
      const methodName = namespace + method[0].toUpperCase() + method.slice(1)

      // check if method is a state or plugin
      actionMethod = result[methodName] || result.plugin[methodName]

      if (!actionMethod) {
        // check for namespace action
        const namespacePlugin = result.modules[namespace]

        if (namespacePlugin && typeof namespacePlugin[methodName] === 'function') {
          actionMethod = namespacePlugin[methodName]
        }
      }
    }

    if (!actionMethod) {
      if (callback.onError) {
        callback.onError(new Error(`Action method '${actionName}' not found`))
      }
      return
    }

    try {
      // Execute the method
      const actionResult = actionMethod(param, context)

      // Handle the result based on type
      if (actionResult instanceof Promise) {
        actionResult
          .then(result => {
            if (callback.onSuccess) callback.onSuccess(result)
          })
          .catch(error => {
            if (callback.onError) callback.onError(error)
          })
      } else if (actionResult instanceof Error) {
        if (callback.onError) callback.onError(actionResult)
      } else {
        if (callback.onSuccess) callback.onSuccess(actionResult)
      }
    } catch (error) {
      if (callback.onError) callback.onError(error)
    }
  }
}
