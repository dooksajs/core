/**
 * Create plugin actions
 * @param {*} setAction
 * @param {*} plugin
 * @param {Object.<string, Function>} actions
 */
function createActions (setAction, plugin, actions) {
  plugin.actions = {}

  for (const key in actions) {
    if (Object.hasOwnProperty.call(actions, key)) {
      const action = actions[key]
      const namespace = plugin.metadata.name + '/' + key

      // set actions
      setAction(namespace, action)

      // set local actions
      plugin.actions[key] = action
    }
  }

  return plugin.actions
}

export default createActions
