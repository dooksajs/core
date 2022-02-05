import DsPlugins from '@dooksa/ds-plugins'
import { name, version } from '../ds.plugin.config'
import myPlugin from 'plugin'

const plugins = new DsPlugins({ isDev: true })

// add plugin metadata
plugins.addMetadata([
  [[name], {
    version
  }]
])

plugins.use({ name, plugin: myPlugin })

console.log(plugins)
