
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

import pluginName from 'myPlugin'

const plugins = new DsPlugins({ isDev: true })

plugins.addMetadata({
  pluginName: {
    currentVersion: '1.0.0',
    items: {
      '1.0.0': {}
    }
  }
})

plugins.use({ name, version, plugin: pluginName, onDemand: true })

```

### Add a remote plugin

This will add plugin metadata that allows the system to load the required version on demand

```js

const plugins = new DsPlugins({ isDev: true })

plugins.addMetadata({
  googleMaps: {
    currentVersion: '2.0.0',
    setupOptions: { // optional
      scriptParamNames: ['key', 'library'],
      scriptParamValues: {
        library: 'places',
        key: 'API_KEY_1'
      }
    },
    items: {
      '2.0.0': {
        src: 'https://www.example.com/ds-plugin-google-maps-2.0.0.js'
      },
      '1.0.0': {
        src: 'https://www.example.com/ds-plugin-google-maps-1.0.0.js',
        setupOptions: { // optional
          scriptParamNames: ['key', 'library'],
          scriptParamValues: {
            library: 'places',
            key: 'API_KEY_2'
          }
        }
      }
    }
  }
})

```

### Change the default plugin version

```js

const plugins = new DsPlugins({ isDev: true })

plugins.setCurrentVersion('googleMaps', '1.0.0')

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
