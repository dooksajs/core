window.pluginLoader.dsTest = {
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
