// import DsPlugins from '@dooksa/ds-plugins'
import DsPlugins from '../../src/index'

describe('loading a test plugin then modify its metadata', () => {
  beforeEach(() => {
    cy.debug()
    cy.visit('http://localhost:8081/')
  })
  it('expect a test plugin to be loaded correctly', () => {
    const plugins = new DsPlugins({ isDev: true })
    // add test plugin
    plugins.use({
      name: 'dsTest',
      plugin: {
        name: 'dsTest',
        version: '1'
      }
    })
    plugins.isLoading(name).then(() => {
      expect(plugins.isLoaded[name])
    })
  })
  // test adding multiple plugin metadata
  it('expect to load a plugin and then change its metadata', () => {
    const plugins = new DsPlugins({ isDev: true })
    plugins.use({
      name: 'dsTest',
      plugin: {
        name: 'dsTest',
        version: '1'
      }
    })
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
    expect(plugins.metadata.dsTest.version === 1)
  })
})
