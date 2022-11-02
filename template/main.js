import dsApp from '@dooksa/ds-app'
import dsDevTool from '@dooksa/ds-plugin-dev-tool'
import dsPlugin from '@dooksa/plugin'
import dsPluginDeps from '@dooksa/pluginDeps'
import bootstrapPage from '../data/index.js'

const plugins = {
  dsPlugin,
  ...dsPluginDeps
}

// Load the plugin and dependencies
for (const key in plugins) {
  if (Object.prototype.hasOwnProperty.call(plugins, key)) {
    dsApp.use(plugins[key], { setupOnRequest: true })
  }
}

dsApp.use(dsDevTool)

// Start app
window.dsDevTool = dsApp.init({
  appRootElementId: 'app',
  isDev: true,
  prefetchedPage: new Promise(resolve => resolve(bootstrapPage))
})
