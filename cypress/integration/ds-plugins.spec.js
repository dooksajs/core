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
// describe('create and run plugin methods', () => {
//   beforeEach(() => {
//     const plugins = new DsPlugins({ isDev: true })
//     plugins.addMetadata([
//       ['dsTest', {
//         version: '0.0.1'
//       }]
//     ])
//   })
//   it('expect a test plugin to be loaded correctly', () => {
//     const plugins = new DsPlugins({ isDev: true })
//     // add test plugin
//     plugins.use({
//       name: 'dsTest',
//       plugin: {
//         name: 'dsTest',
//         version: '1'
//       }
//     })
//     plugins.isLoading(name).then(() => {
//       expect(plugins.isLoaded[name])
//     })
//   })
//   // test adding multiple plugin metadata
//   it('expect to load a plugin and then change its metadata', () => {
//     const plugins = new DsPlugins({ isDev: true })
//     plugins.use({
//       name: 'dsTest',
//       plugin: {
//         name: 'dsTest',
//         version: '1'
//       }
//     })
//     plugins.addMetadata([
//       ['dsTest', {
//         version: '1'
//       }]
//     ])
//     plugins.addMetadata([
//       ['dsTest', {
//         version: '2',
//         src: '/plugins/test-2.js'
//       }]
//     ])
//     expect(plugins.metadata.dsTest.version === 1)
//   })
// })
