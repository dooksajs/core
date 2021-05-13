import DsPlugins from '@dooksa/ds-plugins'
import { name, version } from '../ds.plugin.config'
import dsOperators from 'plugin'

const plugins = new DsPlugins({ isDev: true })

// add plugin metadata
plugins.addMetadata({
  [name]: {
    currentVersion: version,
    items: {
      [version]: {
        core: true
      }
    }
  }
})

console.log(dsOperators)
// use plugin
plugins.use({ name, plugin: dsOperators, onDemand: false })
console.log(plugins)
plugins.action('dsOperators/eval', {
  name: '++x',
  values: [1]
},
{
  onSuccess: (data) => {
    console.log(data)
  }
})
