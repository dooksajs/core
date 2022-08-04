import DsPlugin from '@dooksa/ds-plugin'
import plugin from 'plugin'

// these are part of the app build
const plugins = []

const additionalPlugins = []

const pluginManager = new DsPlugin(plugin)

pluginManager.init({
  buildId: 1,
  plugins,
  additionalPlugins,
  isDev: true
})

console.log(pluginManager)
