import DsPlugin from '@dooksa/ds-plugin'
import dsManager from '../../ds-plugin-manager'
import dsComponent from '../../ds-plugin-component'
import dsLayout from '../src'

const plugins = [
  {
    item: {
      name: dsComponent.name,
      version: dsComponent.version
    },
    plugin: dsComponent,
    options: {
      setupOnRequest: false
    }
  },
  {
    item: {
      name: dsLayout.name,
      version: dsLayout.version,
      setupOptions: {
        html: document.getElementById('app')
      }
    },
    plugin: dsLayout,
    options: {
      setupOnRequest: false
    }
  }
]
// const plugin = new DsPlugin(dsLayout, [])
// console.log(plugin)
// plugin.init({
//   html: document.getElementById('app')
// })

const pluginManager = new DsPlugin(dsManager)
pluginManager.init({
  build: 1,
  plugins,
  DsPlugin,
  isDev: true
})
