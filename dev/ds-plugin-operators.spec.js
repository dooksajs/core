// import DsPlugins from '@dooksa/ds-plugins'
import DsPlugins from '../../src/index'
import { name, version } from '../ds.plugin.config'
import dsOperators from 'plugin'
console.dir(dsOperators)
describe('test adding multiple plugin metadata', () => {
  const plugins = new DsPlugins({ isDev: true })
  plugins.addMetadata(
    [name]: {
      currentVersion: version,
      items: {
        [version]: {
          core: true
        }
      }
    }
  )
})
