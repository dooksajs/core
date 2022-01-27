
# Dooksa plugin management system 

Constructor function for dooksa plugins

### Install dependencies

```
$ npm install
```

### Serve with hot reload at localhost:8080

```
$ npm run dev
```

### Test plugin 

```js
import DsPlugin from '@dooksa/ds-plugins'

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
    _privateMethod () {
      // private method name starts with '_'
    },
    publicMethod () {
      // public method
    }
  }
} 

const plugin = new DsPlugins(myPlugin, [{ name: 'isDev', value: true }])

plugin.init()

```