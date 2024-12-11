/**
 * @import {state} from '#client'
 * @import {PluginState, PluginStateExport} from '@dooksa/create-plugin/types'
 */

import createPlugin from '@dooksa/create-plugin'

/**
 * @param {Object[]} [plugins=[]]
 * @param {string} plugins[].name - Name of plugin
 * @param {PluginState | PluginStateExport} plugins[].state - Plugin schema
 * @returns {Promise<typeof state>}
 */
export function mockState (plugins = []) {
  return new Promise((resolve, reject) => {
    /** @type {PluginStateExport} */
    const _state = {
      _defaults: [],
      _items: [],
      _names: [],
      _values: {},
      defaults: [],
      schema: {}
    }

    // crate schema for state
    for (let i = 0; i < plugins.length; i++) {
      const pluginData = plugins[i]
      let state = pluginData.state

      if (!state.hasOwnProperty('_values')) {
        const plugin = createPlugin(pluginData.name, { state: pluginData.state })

        state = plugin.state
      }

      _state._names = _state._names.concat(state._names)
      _state._items = _state._items.concat(state._items)
      _state._values = Object.assign(_state._values, state._values)

      // append defaults
      if (state._defaults.length) {
        _state._defaults = _state._defaults.concat(state._defaults)
      }
    }

    // import state module
    import('../src/client/state.js')
      .then(({ state }) => {
        // setup state
        state.setup(_state)

        resolve({
          methods: state,
          restore () {
            // restore default state
            state.setup({
              _values: {},
              _items: [],
              _names: [],
              schema: {},
              defaults: [],
              _defaults: []
            })
          }
        })
      })
      .catch(error => reject(error))
  })
}
