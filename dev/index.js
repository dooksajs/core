import DsPlugins from '@dooksa/ds-plugins'

const plugins = new DsPlugins({ isDev: true })

// add test plugin
plugins.use({
  name: 'dsTest/1.0.0',
  plugin: {
    name: 'dsTest',
    version: '1.0.0'
  }
})

// test adding multiple plugin metadata
plugins.addMetadata({
  dsTest: {
    currentVersion: '1.0.0',
    items: {
      '1.0.0': {}
    }
  }
})

plugins.addMetadata({
  dsTest: {
    currentVersion: '1.0.1',
    items: {
      '1.0.0': {},
      '1.0.1': {
        src: '/plugins/test-1.0.1.js'
      }
    }
  }
})

console.log(plugins)

plugins.action('dsTest/1.0.1/sayHi', 'john', { onSuccess: (r) => console.log(r) })
