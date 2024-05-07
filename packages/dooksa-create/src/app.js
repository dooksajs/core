import { Context } from '@dooksa/libraries'
import { getContextActions, getContextComponent, getContextData } from './context.js'

/**
 *
 * @param {Object} [param={}]
 * @param {Array} [param.plugins]
 * @param {Object.<string, *>} [param.setupOptions]
 * @param {Object.<string, string>} [param.imports]
 */
function createApp ({ plugins, setupOptions = {}, imports = {} } = {}) {
  // make deep clone
  const context = new Context(plugins)
  const $component = getContextComponent(context.components)
  const $action = getContextActions(context.actions, imports)

  setupOptions.action = $action
  setupOptions.component = $component

  // setup database
  for (let i = 0; i < context.setup.length; i++) {
    const setup = context.setup[i]
    if (setup.name === 'data') {
      setup.initialize(context.data)

      // remove from setup queue
      context.setup.splice(i)
      break
    }
  }

  for (let i = 0; i < context.setup.length; i++) {
    const setup = context.setup[i]
    const options = setupOptions[setup.name]

    setup.initialize(options)
  }
}

export { createApp }
