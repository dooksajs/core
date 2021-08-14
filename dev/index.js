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
// use plugin eval with numeric inputs
plugins.use({ name, plugin: dsOperators, onDemand: false })
const params = (new URL(document.location)).searchParams
if (params.has('operator')) {
  const op = ((`${params.get('operator')}` || '++x')) // default operator
  plugins.action('dsOperators/eval', {
    name: op,
    values: [`${params.get('operand-0')}`, `${params.get('operand-1')}`]
  },
  {
    onSuccess: (data) => {
      const evalDisplay = document.querySelector('#data-eval')
      evalDisplay.innerHTML = `${params.get('operand-0')} ${params.get('operator')}${params.get('operand-1')} -> ${data}`
    },
    onError: (error) => {
      const evalDisplay = document.querySelector('#data-eval')
      evalDisplay.innerHTML = `${error}`
    }
  })
}
