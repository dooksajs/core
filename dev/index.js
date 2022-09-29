import dsApp from '@dooksa/ds-app'
import dsParse from '@dooksa/ds-plugin-parse'
import dsDevTool from '@dooksa/ds-plugin-dev-tool'
import dsTemplate from '@dooksa/ds-plugin-template'
import dsDatabase from '@dooksa/ds-plugin-database'
import dsPlugin from '@dooksa/plugin'
import dsPluginConfig from '@dooksa/pluginConfig'
import dsPluginDeps from '@dooksa/pluginDeps'
import bootstrapPage from './pages/index.js'

const devPlugins = [
  dsParse,
  dsDevTool,
  dsTemplate,
  dsDatabase
]
const plugins = dsPluginDeps

plugins[dsPlugin.name] = dsPlugin

// Load the plugin and dependencies
for (const key in plugins) {
  if (Object.prototype.hasOwnProperty.call(plugins, key)) {
    // avoid duplicates plugins
    for (let i = 0; i < devPlugins.length; i++) {
      const plugin = devPlugins[i]
      
      if (plugin.name === plugins[key].name) {
        devPlugins.splice(i, 1)
        break
      }
    }

    dsApp.use(plugins[key], { setupOnRequest: true })
  }
}

// Add dev tools
for (let i = 0; i < devPlugins.length; i++) {
  dsApp.use(devPlugins[i])
}

// Start app
window.dsDevTool = dsApp.init({
  assetsURL: 'http://localhost:8080',
  appRootElementId: 'app',
  isDev: true,
  prefetchedPage: new Promise(resolve => resolve(bootstrapPage))
})
