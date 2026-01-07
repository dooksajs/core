import createPlugin from '@dooksa/create-plugin'

/**
 * @import {DsPluginState, DsPluginStateExport} from '@dooksa/create-plugin/types'
 * @import { TestContext } from 'node:test'
 */

/**
 * Creates a mock state environment for testing
 *
 * @param {Object[]} [plugins=[]] - Array of plugin objects
 * @param {string} plugins[].name - Name of plugin
 * @param {DsPluginState | DsPluginStateExport} plugins[].state - Plugin schema
 */
export function mockStateData (plugins = []) {
  /** @type {DsPluginStateExport} */
  const _state = {
    _defaults: [],
    _items: [],
    _names: [],
    _values: {},
    defaults: [],
    schema: {}
  }

  // Create schema for state
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

      // Append defaults
      if (state._defaults.length) {
        _state._defaults = _state._defaults.concat(state._defaults)
      }
    }
  }

  return _state
}
