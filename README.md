
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

### Manually add plugin

This will add plugin metadata that allows the system to load the required version on demand

```js

const plugins = new DsPlugins({ isDev: true })

plugins.addMetadata({
  googleMaps: {
    currentVersion: '2.0.0',
    items: {
      '2.0.0': {
          src: 'https://www.example.com/ds-plugin-google-maps-2.0.0.js',
          setupOptions: { // optional
            dev: true
          },
          urlParams: { // optional
            names: ['key', 'libraries'],
            values: {
              api: 'API_KEY'
            }
          }
        }
      },
      '1.0.0': {
        src: 'https://www.example.com/ds-plugin-google-maps-1.0.0.js'
      }
    }
  }
})

```

### Run a plugin method

```js

const plugins = new DsPlugins({ isDev: true })

plugins.action({
  pluginName: 'googleMaps',
  methodName: 'addMarker',
  params: { 
    mapId: 'map',
    options: {
      lat: 0,
      lng: 0
    }
  }, 
  callback: (result) => console.log(result)
})

```