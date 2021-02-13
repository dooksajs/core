
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

### Add plugin

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

### Change the default plugin version

```js

const plugins = new DsPlugins({ isDev: true })

plugins.setCurrentVersion('googleMaps', '1.0.0')

```

### Run a plugin method

The action method will use the 'currentVersion' of the plugin

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
  callback: (result, status) => {
    if (status === plugins.PluginActionStatus.OK) {
      console.log(result)
    }
  }
})

```

### Plugin callback results

Successful action results will be the returned value from the requested plugin method, an unsuccessful action results will be an error from the requested plugin method 

To check if a action was successful, compare the status argument to the plugin constant "OK" 

```js

 callback: (result, status) => {
    if (status === plugins.PluginActionStatus.OK) {
      console.log(result)
    }
  }

```