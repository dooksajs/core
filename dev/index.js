import DsPlugin from '@dooksa/ds-plugin'
import myPlugin from '../src'

const plugin = new DsPlugin(myPlugin, [])
console.log(plugin)
plugin.init()
