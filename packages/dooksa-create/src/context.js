import { Context } from '@dooksa/libraries'

let activeContext = new Context()

/**
 * Get active context
 * @returns {Context}
 */
function getActiveContext () {
  return activeContext
}

/**
 * Set active context
 * @param {Context} context
 */
function setActiveContext (context) {
  activeContext = context
}

function getContextComponent (component) {
  return (name) => {
    return component[name]
  }
}

function getContextData (data) {
  return (name) => {
    return {
      values: data.values[name],
      schema: data.schema[name]
    }
  }
}

/**
 * @param {*} actions
 * @param {*} imports
 * @returns
 */
function getContextActions (actions, imports) {
  return (name, params) => {
    if (typeof actions[name] === 'function') {
      return actions[name](params)
    } else {
      const pluginName = name.split('/')[0]
      const fileName = imports[pluginName]

      if (fileName) {
        import(`./plugins/${fileName}.js`)
          .then(({ default: plugin }) => {
            console.log(plugin)
          })
      }
    }
  }
}

export {
  getActiveContext,
  setActiveContext,
  getContextData,
  getContextActions,
  getContextComponent
}
