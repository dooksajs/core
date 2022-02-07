// import DsPlugins from '@dooksa/ds-plugins'
import DsPlugin from '../../src/index'

const dsTest = {
  name: 'dsTest',
  version: '1',
  data: {
    text: 'hello'
  },
  methods: {
    sayHi (name) {
      return this.text + ' ' + name
    }
  }
}

describe('check plugin created', () => {
  it('check plugin name', () => {
    const plugin = new DsPlugin(dsTest, [{ name: 'isDev', value: true }])
    expect(plugin.name).equal('dsTest')
  })
})
