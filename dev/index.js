import DsPlugin from '@dooksa/ds-plugin'
import dsLayout from '../src'

const plugin = new DsPlugin(dsLayout, [])
console.log(plugin)
plugin.init({
  html: document.getElementById('app')
})
