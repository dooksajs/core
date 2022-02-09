import DsPlugin from '@dooksa/ds-plugin'

const dsTest = {
  name: 'dsTest',
  version: '2',
  data: {
    text: 'hello'
  },
  methods: {
    sayHi (name) {
      return this.text + ' ' + name
    }
  }
}

const plugin = new DsPlugin(dsTest, [])

plugin.init()

const sayhi = document.querySelector('#data-sayhi')
sayhi.innerHTML = plugin.methods.sayHi('John')
