// import DsPlugins from '@dooksa/ds-plugins'
import DsPlugins from '../../src/index'

describe('test adding multiple plugin metadata', () => {
  const plugins = new DsPlugins({ isDev: true })
  plugins.addMetadata([
    ['dsTest', {
      version: '0.0.1'
    }]
  ])
  it('metadata to be added', () => {
    expect(plugins.metadata.dsTest.version).equal('0.0.1')
  })
  it('use a plugin with no methods', () => {
    // **FIXME** This is rubbish
    const pluginState = plugins.use({
      name: 'dsTest'
    })
    // **TODO** assertion can be improved to test for an empty object
    // unsuccessfully tried chai assertions .to.be.empty() and .to.be.an('object')
    expect(typeof (pluginState)).to.equal('object')
  })
  it('use a plugin and add a plugin to it', () => {
    plugins.use({
      name: 'dsTest',
      plugin: {
        name: 'dsSubTest',
        version: '0.0.1',
        data: {
          say: 'Hi',
          age: 0
        }
      }
    })
    // **FIXME**
    // expect(plugins.name.dsTest.plugin.version).equal('0.0.2')
  })
})
