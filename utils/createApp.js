import dsApp from '@dooksa/ds-app'
import dsDevTool from '@dooksa/ds-plugin-devtool'
import dsPlugin from '@dooksa/plugin'
import dsParse from '@dooksa/ds-plugin-parse'

// start app
export default (page, { setup = {}, plugins = {} }, pluginSetup = { setupOnRequest: true }) => {
  let app = dsApp

  if (plugins.dsApp) {
    app = plugins.dsApp

    delete plugins.dsApp
  }

  if (plugins.DsPlugin) {
    app.DsPlugin = plugins.DsPlugin

    delete plugins.DsPlugin
  }

  if (plugins.dsManager) {
    app.dsManager = plugins.dsManager

    delete plugins.dsManager
  }

  const pluginsToAdd = {
    dsDevTool,
    dsParse,
    ...plugins
  }

  // load the plugin and dependencies
  for (const key in pluginsToAdd) {
    if (Object.prototype.hasOwnProperty.call(pluginsToAdd, key)) {
      const options = setup[key] || {}
      app.use(pluginsToAdd[key], options)
    }
  }

  // add current plugin
  app.use(dsPlugin, pluginSetup)

  return app.init({
    appRootElementId: 'app',
    isDev: true,
    page
  })
}
