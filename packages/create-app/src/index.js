import { dsManager, dsData, dsOperator, DsPlugin } from '@dooksa/ds-plugin'

/** @typedef {import('@dooksa/utils/src/types.js').DsPluginData} DsPluginData */
/** @typedef {import('@dooksa/utils/src/types.js').DsPluginOptions} DsPluginOptions */

export default () => ({
  /**
   * Add dooksa plugins to the app
   * @param {Object[]} plugins
   * @param {string} plugins[].name - Name of plugin
   * @param {number} plugins[].version - Version of plugin
   * @param {DsPluginData} plugins[].value - dsPlugin
   * @param {DsPluginOptions[]} [plugins[].options] - Plugin options
   */
  use (plugins) {
    // ISSUE: add plugin schema checks
    // Make a copy of the plugin list and nested data
    this._plugins = this._plugins.concat(plugins)

    // this is pretty weak protection
    for (let i = 0; i < this._plugins.length; i++) {
      if (this._plugins[i].value) {
        this._plugins[i].value = Object.assign(this._plugins[i].value, {})
      }

      this._plugins[i] = Object.assign(this._plugins[i], {})
    }
  },
  /**
   * @param {Object} setup
   * @param {DsPluginOptions[]} setup.options[]
   * @param {boolean} [setup.isDev] - Set the app in development mode
   * @param {boolean} [setup.isServer] - Set if the current app is server side
   * @returns {Object|undefined} - Development mode functions used to interact with the app
   */
  start ({ options = [], isDev, isServer }, { onSuccess, onError }) {
    const pluginManager = new DsPlugin(dsManager)

    for (let i = 0; i < options.length; i++) {
      const option = options[i]
      const plugin = this._getPlugin(option.name)

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
    pluginManager.init({
      plugins: this._plugins,
      isDev,
      isServer,
      onSuccess,
      onError
    })
  },
  _plugins: [
    {
      name: dsOperator.name,
      version: dsOperator.version,
      value: dsOperator
    },
    {
      name: dsData.name,
      version: dsData.version,
      value: dsData
    }
  ],
  _getPlugin (name) {
    return this._plugins.find(item => item.name === name)
  }
})
