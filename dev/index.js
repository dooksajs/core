import DsPlugins from '@dooksa/ds-plugins'
import { name, version } from '../ds.plugin.config'
import Plugin from 'plugin'

const plugins = new DsPlugins({ isDev: true })

// add plugin metadata
plugins.addMetadata([
  [[name], {
    version
  }]
])

plugins.use({ name, plugin: Plugin })

console.log(plugins)
