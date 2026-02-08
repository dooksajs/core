import { state, api, action as originalAction } from '#core'

/**
 * Helper to extract action methods from a list of actions or map
 * @param {Array|Object} actions
 * @returns {Object} Map of action names to methods
 */
function getActionsMap (actions) {
  const map = {}
  if (!actions) return map

  const list = Array.isArray(actions) ? actions : Object.values(actions)

  list.forEach(a => {
    // Check if item is valid action object or just the function itself if passed as object values
    if (a && a.name && typeof a.method === 'function') {
      map[a.name] = a.method
    } else if (typeof a === 'function' && a.name) {
      // This handles if actions are passed as { name: func }
      map[a.name] = a
    }
  })

  return map
}

/**
 * Returns a map of default actions from state, api, and the action plugin itself.
 * Useful for mocking action execution in tests.
 *
 * @param {Object} actionInstance - The action plugin instance being tested
 * @param {Array} [additionalPlugins=[]] - Additional plugins to include actions from
 * @returns {Object} Map of action names to methods
 */
export function getDefaultActions (actionInstance, additionalPlugins = []) {
  const defaultActions = {}

  // We need actions from state and api plugins as they might be used
  // e.g. state_setValue, api_fetch etc.
  const plugins = [actionInstance, state, api, ...additionalPlugins]

  plugins.forEach(plugin => {
    if (plugin && plugin.actions) {
      Object.assign(defaultActions, getActionsMap(plugin.actions))
    }
  })

  // Ensure original actions are included as well (e.g. core actions)
  if (originalAction && originalAction.actions) {
    Object.assign(defaultActions, getActionsMap(originalAction.actions))
  } else if (originalAction) {
    // Fallback for cases where originalAction might be passed directly like in the original test
    Object.assign(defaultActions, getActionsMap(originalAction))
  }

  return defaultActions
}
