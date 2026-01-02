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

      // Type guard to ensure state has the required properties
      if (state.hasOwnProperty('_values') && '_names' in state && '_items' in state && '_values' in state && '_defaults' in state) {
        _state._names = _state._names.concat(state._names)
        _state._items = _state._items.concat(state._items)
        _state._values = Object.assign(_state._values, state._values)

        // append defaults
        if (state._defaults.length) {
          _state._defaults = _state._defaults.concat(state._defaults)
        }
      }
    }

    // import state module
    import('../src/client/state.js?' + crypto.randomUUID().substring(30))
      .then((stateModule) => {
        const { state } = stateModule

        // setup state
        state.setup(_state)

        // Create wrapper with direct method access for compatibility
        const mockStateInstance = {
          // Direct access to state methods
          setValue: stateModule.stateSetValue,
          getValue: stateModule.stateGetValue,
          addListener: stateModule.stateAddListener,
          deleteListener: stateModule.stateDeleteListener,
          deleteValue: stateModule.stateDeleteValue,
          find: stateModule.stateFind,
          generateId: stateModule.stateGenerateId,
          getSchema: stateModule.stateGetSchema,
          unsafeSetValue: stateModule.stateUnsafeSetValue,

          // Also expose the full state module
          ...state
        }

        resolve(mockStateInstance)
      })
      .catch(error => reject(error))
  })
}
