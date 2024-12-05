/**
 * @import {Plugin, PluginSchemaEntries} from '../../create-plugin/src/index.js'
 * @import {AppPlugin, AppSetup} from '#types'
 */

/**
 * @callback UsePlugin
 * @param {Plugin} plugin
 */

/**
 * Append plugin
 * @returns  {AppPlugin}
 */
export default function appendPlugin () {
  /** @type {Plugin[]} */
  const appPlugins = []
  /** @type {AppSetup[]} */
  let appSetup = []
  /** @type {Object.<string, Function>} */
  const appActions = {}
  /** @type {PluginSchemaEntries} */
  const appSchema = {
    values: {},
    items: [],
    names: []
  }

  return {
    /**
     * @param {Plugin} plugin
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
      if (plugin.$schema) {
        const schema = plugin.$schema
        appSchema.values = Object.assign(appSchema.values, schema.values)
        appSchema.names = appSchema.names.concat(schema.names)
        appSchema.items = appSchema.items.concat(schema.items)
      }
    },
    get plugins () {
      return appPlugins
    },
    get schema () {
      return appSchema
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
