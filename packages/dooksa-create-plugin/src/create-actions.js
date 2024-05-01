/**
 * Create plugin actions
 * @param {*} setAction
 * @param {*} plugin
 * @param {Object.<string, Function>} actions
 * @returns {DsAction}
 */
function createActions (setAction, plugin, actions) {
  const pluginName = plugin.metadata.name
  plugin.actions = new DsAction()

  for (const key in actions) {
    if (Object.hasOwnProperty.call(actions, key)) {
      const action = actions[key]
      const namespace = pluginName + '/' + key

      // set actions
      setAction(namespace, action)

      plugin.actions.add(key, action)
      // set local actions
      plugin.actions[key] = action
    }
  }

  return plugin.actions
}


/**
 * Set data value
 * @constructor
 */
function DsAction () {}

/**
 * Add action
 * @param {string} key
 * @param {*} action
 */
DsAction.prototype.add = function (key, action) {
  this[key] = action
}

export { DsAction }

export default createActions
