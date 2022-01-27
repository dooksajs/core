
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
import myPlugin from 'myPlugin'

const plugin = new DsPlugins(myPlugin, [{ name: 'isDev', value: true }])

plugin.init()

```