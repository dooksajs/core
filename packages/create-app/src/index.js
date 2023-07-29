import DsPlugin from '@dooksa/ds-plugin'
import dsManager from '@dooksa/ds-plugin-manager'

const plugins = {}

export default () => ({
  use (plugin) {
    // ISSUE: add plugin schema checks
    plugins[plugin.name] = plugin
  },
  start ({ options = [], assetsURL, isDev }) {
    const pluginManager = new DsPlugin(dsManager, [], isDev)

    for (let i = 0; i < options.length; i++) {
      const option = options[i]
      const plugin = plugins[option.name]

      if (plugin) {
        if (plugin.options) {
          let setup = option.setup

          if (plugin.options.setup) {
            setup = Object.assign(plugin.options.setup, setup)
          }

          plugin.options.setup = setup
        } else {
          plugin.options = {
            setup: option.setup
          }
        }
      }
    }

    // start dooksa
    return pluginManager.init({
      build: 1,
      plugins,
      DsPlugin,
      isDev
    })
  }
})
