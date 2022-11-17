import dsApp from '@dooksa/ds-app'
import dsDevTool from '@dooksa-extra/ds-plugin-devtool'
import currentDsPlugin from '@dooksa/plugin'
import dsDependencies from 'dsDependencies'
import dsParse from '@dooksa-extra/ds-plugin-parse'

let app = dsApp

if (dsDependencies.dsApp) {
  app = dsDependencies.dsApp

  delete dsDependencies.dsApp
}

if (dsDependencies.DsPlugin) {
  app.DsPlugin = dsDependencies.DsPlugin

  delete dsDependencies.DsPlugin
}

if (dsDependencies.dsManager) {
  app.dsManager = dsDependencies.dsManager

  delete dsDependencies.dsManager
}

const plugins = {
  dsDevTool,
  dsParse,
  ...dsDependencies,
  [currentDsPlugin.name]: currentDsPlugin
}

// load the plugin and dependencies
for (const key in plugins) {
  if (Object.prototype.hasOwnProperty.call(plugins, key)) {
    app.use(plugins[key], { setupOnRequest: true })
  }
}

// start app
export default (page) => {
  return app.init({
    appRootElementId: 'app',
    isDev: true,
    page
  })
}
