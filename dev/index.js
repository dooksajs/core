import DsPlugin from '@dooksa/ds-plugin'
// import { name, version } from '../ds.plugin.config'
// import Plugin from 'plugin'

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
  getters: {
    // getters
    _privateGetter () {
      // private getter name starts with '_'
    },
    publicMethod () {
      // public getter
    }
  },
  methods: {
    _privateMethod (params) {
      // private method name starts with '_'
    },
    publicMethod (context, params) {
      // public method
    }
  }
}

const plugin = new DsPlugin(myPlugin, [])

plugin.init()
