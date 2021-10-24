import DsPlugins from '@dooksa/ds-plugins'
import { name, filename, version, integrity } from '../ds.plugin.config'

const plugins = new DsPlugins({ isDev: true })

// add plugin metadata
plugins.addMetadata([
  [[name], {
    version,
    script: {
      src: `/dist/${filename}.js`,
      integrity
    }
  }]
])

plugins.use({ name, version })

console.log(plugins)
