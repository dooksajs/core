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

// console.log(dsOperators)
// use plugin
plugins.use({ name, plugin: dsOperators, onDemand: false })
const params = (new URL(document.location)).searchParams

plugins.action('dsOperators/eval', {
  name: '++x',
  values: [`${params.get('numeric-operand-0')}`]
},
{
  onSuccess: (data) => {
    const incrementDisplay = document.querySelector('#data-increment')
    incrementDisplay.innerHTML = `${data}`
  }
})
