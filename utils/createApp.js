import dsApp from '@dooksa/ds-app'
import dsDevTool from '@dooksa/ds-plugin-devtool'
import dsPlugin from '@dooksa/plugin'
import dsTemplate from '@dooksa/ds-plugin-template'
import dsParse from '@dooksa/ds-plugin-parse'

// start app
export default (
  page, {
    options,
    app = dsApp,
    plugins = [],
    pluginConstructor,
    pluginManager
  },
  currentOptions = {}
) => {
  if (pluginConstructor) {
    app.DsPlugin = pluginConstructor
  }

  if (pluginManager) {
    app.dsManager = pluginManager
  }

  const requiredPluginNames = ['dsDevTool', 'dsParse', 'dsTemplate']
  const requiredPlugins = { dsDevTool, dsParse, dsTemplate }

  // load the plugin and dependencies
  for (let i = 0; i < plugins.length; i++) {
    const item = plugins[i]
    const options = item.options ?? {}
    const pluginIndex = requiredPluginNames.indexOf(item.name)

    if (pluginIndex > -1) {
      requiredPluginNames.splice(pluginIndex, 1)
    }

    app.use(item.plugin, options)
  }

  for (let i = 0; i < requiredPluginNames.length; i++) {
    const name = requiredPluginNames[i]

    app.use(requiredPlugins[name], {})
  }

  // add current plugin
  app.use(dsPlugin, currentOptions)

  return app.init({
    isDev: true,
    dsPage: page
  })
}
