
# Dooksa plugin management system 

Provides the ability for ds-app to add custom plugins

### Install dependencies

```
$ npm install
```

### Serve with hot reload at localhost:8080

```
$ npm run dev
```

### Add a local plugin

```js

import myPlugin from 'myPlugin'

const plugins = new DsPlugins({ isDev: true })

plugins.addMetadata([
  [myPlugin.name, {
    version: myPlugin.version,
  }]
])

plugins.use({ name, plugin: myPlugin, onDemand: true })

```

### Add a remote plugin

This will add plugin metadata that allows the system to load the required version on demand

```js

const plugins = new DsPlugins({ isDev: true })

plugins.addMetadata([
  ['googleMaps', {
    version: '1.0.0',
    setupOptions: { // optional
      scriptParamNames: ['key', 'library'],
      scriptParamValues: {
        library: 'places',
        key: 'API_KEY_1'
      }
    },
    script: {
      src: 'https://www.example.com/ds-plugin-google-maps-1.0.0.js',
      integrity: 'sha512-NHj3yHLIurjFff1+vOIPJo7atTwujzZW+1YTG8hzJMqFhxED3JZx7Vpv+Pz/IEx7Hj38MCrNqalo+XkQqmjqNQ=='
    }
  }]
])

plugins.use({ name: 'googleMaps' })

```

### Run a plugin method

The action method will use the 'currentVersion' of the plugin

```js

const plugins = new DsPlugins({ isDev: true })

plugins.action('googleMaps/addMarker',
  {
    mapId: 'map',
    options: {
      lat: 0,
      lng: 0
    }
  },
  {
    onSuccess: (result) => {
      console.log(result)
    },
    onError: (error) => {
      console.error(error)
    }
  }
)

```
