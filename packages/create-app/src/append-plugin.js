/**
 * @import {DsPlugin, DsPluginStateExport} from '../../create-plugin/types.js'
 * @import {AppPlugin, AppSetup} from '#types'
 */

/**
 * @callback UsePlugin
 * @param {DsPlugin} plugin
 */

/**
 * Append plugin
 * @returns  {AppPlugin}
 */
export default function appendPlugin () {
  /** @type {DsPlugin[]} */
  const appPlugins = []
  /** @type {AppSetup[]} */
  let appSetup = []
  /** @type {Object.<string, Function>} */
  const appActions = {}
  /** @type {DsPluginStateExport} */
  const appState = {
    _defaults: [],
    _items: [],
    _names: [],
    _values: {},
    defaults: [],
    schema: {}
  }

  return {
    /**
     * @param {DsPlugin} plugin
     */
    use (plugin) {
    // check if plugin exists
      if (appPlugins.includes(plugin)) {
        const setup = plugin.setup

        // remove setup
        if (setup) {
          for (let i = 0; i < appSetup.length; i++) {
            const item = appSetup[i]

            if (item.setup === setup) {
              appSetup.splice(i, 1)
              i--
            }
          }
        }

        return
      }

      // store plugin
      appPlugins.push(plugin)
      const dependencies = plugin.dependencies
      const name = plugin.name
      const actions = plugin.actions

      if (plugin.setup) {
        appSetup.push({
          name,
          setup: plugin.setup
        })
      }

      if (dependencies) {
        for (let i = 0; i < dependencies.length; i++) {
          this.use(dependencies[i])
        }
      }

      // append actions
      if (appActions && actions) {
        for (let i = 0; i < actions.length; i++) {
          const action = actions[i]

          appActions[action.name] = action.method
        }
      }

      // extract data (need to parse and set default value)
      if (plugin.state) {
        const state = plugin.state

        appState._values = Object.assign(appState._values, state._values)
        appState._names = appState._names.concat(state._names)
        appState._items = appState._items.concat(state._items)

        // append defaults
        if (state._defaults.length) {
          appState._defaults = appState._defaults.concat(state._defaults)
        }
      }
    },
    get plugins () {
      return appPlugins
    },
    get state () {
      return appState
    },
    get actions () {
      return appActions
    },
    get setup () {
      return appSetup
    },
    set setup (value) {
      appSetup = value
    }
  }
}
