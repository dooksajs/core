import dsApp from '@dooksa/ds-app'
import dsDevTool from '@dooksa-extra/ds-plugin-devtool'
import dsPlugin from '@dooksa/plugin'
import dsParse from '@dooksa-extra/ds-plugin-parse'

// start app
export default (page, devDependencies = {}) => {
  let app = dsApp

  if (devDependencies.dsApp) {
    app = devDependencies.dsApp

    delete devDependencies.dsApp
  }

  if (devDependencies.DsPlugin) {
    app.DsPlugin = devDependencies.DsPlugin

    delete devDependencies.DsPlugin
  }

  if (devDependencies.dsManager) {
    app.dsManager = devDependencies.dsManager

    delete devDependencies.dsManager
  }

  const plugins = {
    dsDevTool,
    dsParse,
    ...devDependencies,
    [dsPlugin.name]: dsPlugin
  }

  // load the plugin and dependencies
  for (const key in plugins) {
    if (Object.prototype.hasOwnProperty.call(plugins, key)) {
      app.use(plugins[key], { setupOnRequest: true })
    }
  }
  return app.init({
    appRootElementId: 'app',
    isDev: true,
    page
  })
}
