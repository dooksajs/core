// import DsPlugins from '@dooksa/ds-plugins'
import DsPlugins from '../../src/index'

describe('loading a test plugin then modify its metadata', () => {
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
    expect(plugins.metadata.dsTest.version === 2)
  })
})
describe('load and run a test plugin', () => {
  it('use a plugin action', () => {
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
        src: '/plugins/test-2.js'
      }]
    ])
    plugins.action('dsTest/sayHi', 'john', { onSuccess: (r) => expect(r).to.equal('hello john') })
  })
  /* not testing:
    1. "invalid" action callbacks;
  */
  it('use a plugin action but specifies the wrong name', () => {
    /* expect runtime error(browser example):
    action does not exist: dsTest/sayHa index.js:105:16
    callbackWhenAvailable index.js:105
    (Async: promise callback)
    callbackWhenAvailable index.js:101
    action index.js:38
    <anonymous> index.js:30
    <anonymous> main.js:10321
    <anonymous> main.js:10509
    */
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
        src: '/plugins/test-2.js'
      }]
    ])
    plugins.action('dsTest/sayHa', 'john', {
      onSuccess: (r) => expect(r).to.equal('hello john'),
      onError: (e) => { expect(e).to.equal('hello john') } /* this should have failed */
    })
  })
})
