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
    const pluginState = plugins.use({
      name: 'dsTest'
    })
    // **TODO** assertion can be improved to test for an empty object
    // unsuccessfully tried chai assertions .to.be.empty() and .to.be.an('object')
    expect(typeof (pluginState)).to.equal('object')
  })
})
