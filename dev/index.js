import DsPlugin from '@dooksa/ds-plugin'
import dsOperators from '../src'

const plugin = new DsPlugin(dsOperators, {
  name: '$method',
  dispatch: false
})
console.log(plugin.methods.eval({ name: '==', values: [1, 1] }))
