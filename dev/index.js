import DsPlugin from '@dooksa/ds-plugin'

const myPlugin = {
  name: 'myPlugin',
  version: 1,
  dependencies: [
    // list of plugin dependencies
  ],
  data: {
    //  plugin data
  },
  setup () {
    // setup is the first function executed
  },
  methods: {
    publicMethod (context, params) {
      // public method
    },
    _privateMethod (params) {
      // private method name starts with '_'
    }
  }
}

const plugin = new DsPlugin(myPlugin, [])

plugin.init()
