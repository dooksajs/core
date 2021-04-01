window.pluginLoader['dsTest/1.0.1'] = {
  name: 'dsTest',
  version: '1.0.1',
  data: {
    text: 'hello'
  },
  methods: {
    sayHi (name) {
      return this.text + ' ' + name
    }
  }
}
