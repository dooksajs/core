import DsPlugins from '@dooksa/ds-plugins'

const plugins = new DsPlugins({ isDev: true })

// add test plugin
plugins.use({
  name: 'dsTest',
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
        src: '/dist/test-1.0.1.js'
      }
    }
  }
})

console.log(plugins.metadata.dsTest)

// change default plugin version
console.log(`previous version: ${plugins.metadata.dsTest.currentVersion}`)
plugins.setCurrentVersion('dsTest', '1.0.1')
console.log(`current version: ${plugins.metadata.dsTest.currentVersion}`)

console.log(plugins)
