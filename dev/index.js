import DsPlugins from '@dooksa/ds-plugins'
import { name, filename, version } from '../ds.plugin.config'

const plugins = new DsPlugins({ isDev: true })

// add plugin metadata
plugins.addMetadata([
  [[name], {
    version,
    script: {
      src: `/dist/${filename}.js`,
      integrity: 'sha512-NHj3yHLIurjFff1+vOIPJo7atTwujzZW+1YTG8hzJMqFhxED3JZx7Vpv+Pz/IEx7Hj38MCrNqalo+XkQqmjqNQ=='
    }
  }]
])

plugins.use({ name })

console.log(plugins)
