/**
 * @import {state} from '#client'
 * @import {DsPluginState, DsPluginStateExport} from '@dooksa/create-plugin/types'
 */

import createPlugin from '@dooksa/create-plugin'

/**
 * @param {Object[]} [plugins=[]]
 * @param {string} plugins[].name - Name of plugin
 * @param {DsPluginState | DsPluginStateExport} plugins[].state - Plugin schema
 * @returns {Promise<state>}
 */
export function mockState (plugins = []) {
  return new Promise((resolve, reject) => {
    /** @type {DsPluginStateExport} */
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
    import('../src/client/state.js?' + crypto.randomUUID().substring(30))
      .then(({ state }) => {
        // setup state
        state.setup(_state)

        resolve(state)
      })
      .catch(error => reject(error))
  })
}
