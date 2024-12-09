/**
 * @import {state} from '../src/client/state.js'
 * @import {PluginStateGetter} from '@dooksa/create-plugin/types'
 */

import createPlugin from '@dooksa/create-plugin'

/**
 * @typedef {Object} MockState
 * @property {state} state - State plugin
 * @property {Function} restore - Reset state
 */

/**
 * @param {Object[]} [plugins=[]]
 * @param {string} plugins[].name - Name of plugin
 * @param {PluginStateGetter} plugins[].state - Plugin schema
 * @returns {Promise<MockState>}
 */
export function mockState (plugins = []) {
  return new Promise((resolve, reject) => {
    /** @type {PluginStateGetter} */
    const _state = {
      values: {},
      items: [],
      names: [],
      schema: {}
    }

    // crate schema for state
    for (let i = 0; i < plugins.length; i++) {
      const { name, state } = plugins[i]
      const plugin = createPlugin(name, { state })

      _state.names = _state.names.concat(plugin.state.names)
      _state.items = _state.items.concat(plugin.state.items)
      _state.values = Object.assign(_state.values, plugin.state.values)
    }

    // import state module
    import('../src/client/state.js')
      .then(({ state }) => {
        // setup state
        state.setup(_state)

        resolve({
          state,
          restore () {
            // restore default state
            state.setup({
              values: {},
              items: [],
              names: [],
              schema: {}
            })
          }
        })
      })
      .catch(error => reject(error))
  })
}
