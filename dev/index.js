<<<<<<< HEAD
import dsPlugins from '@dooksa/ds-plugins'
import myPlugin from 'plugin'

const plugins = dsPlugins(myPlugin)
=======
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

>>>>>>> 7c34b3602645b5f71aeb847c53e256c48a5e0864
console.log(plugins)
