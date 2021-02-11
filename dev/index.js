import DsPlugins from '@dooksa/ds-plugins'

const plugins = new DsPlugins({ isDev: true })

// run plugin method
plugins.action({
  pluginName: 'dsFirebaseAuth',
  methodName: 'error',
  params: {
    code: '404',
    message: 'page not found'
  },
  callback: (e) => console.error(e)
})

// test adding multiple plugin metadata
plugins.addMetadata({
  dsTest: {
    currentVersion: '1.0.0',
    items: {
      '1.0.0': {
        src: '/dist/test.js'
      }
    }
  }
})

plugins.addMetadata({
  dsTest: {
    currentVersion: '1.0.1',
    items: {
      '1.0.0': {
        src: '/dist/test-1.0.0.js'
      },
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
