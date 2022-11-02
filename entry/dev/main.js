import dsApp from '@dooksa/ds-app'
import dsParse from '@dooksa/ds-plugin-parse'
import dsDevTool from '@dooksa-extra/ds-plugin-devtool'
import dsPlugin from '@dooksa/plugin'
// import dsPluginDeps from '@dooksa/pluginDeps'
import bootstrapPage from './data/index.js.js'

const plugins = [
  dsParse,
  dsDevTool,
  dsPlugin
]
// const plugins = dsPluginDeps

// plugins[dsPlugin.name] = dsPlugin

// // Load the plugin and dependencies
// for (const key in plugins) {
//   if (Object.prototype.hasOwnProperty.call(plugins, key)) {
//     // avoid duplicates plugins
//     for (let i = 0; i < devPlugins.length; i++) {
//       const plugin = devPlugins[i]
      
//       if (plugin.name === plugins[key].name) {
//         devPlugins.splice(i, 1)
//         break
//       }
//     }

//     dsApp.use(plugins[key], { setupOnRequest: true })
//   }
// }

// Add plugins
for (let i = 0; i < plugins.length; i++) {
  dsApp.use(plugins[i])
}

// Start app
window.dsDevTool = dsApp.init({
  appRootElementId: 'app',
  isDev: true,
  prefetchedPage: new Promise(resolve => resolve(bootstrapPage))
})
