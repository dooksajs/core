import DsPlugins from '@dooksa/ds-plugins'

const plugins = new DsPlugins({ isDev: true })

// add test plugin
plugins.use({
  name: 'dsTest',
  plugin: {
    name: 'dsTest',
    version: '1'
  }
})

// test adding multiple plugin metadata
plugins.addMetadata([
  ['dsTest', {
    version: '1'
  }]
])

plugins.addMetadata([
  ['dsTest', {
    version: '2',
    src: '/plugins/test-2.js'
  }]
])

console.log(plugins)

plugins.action('dsTest/sayHi', 'john', { onSuccess: (r) => console.log(r) })
