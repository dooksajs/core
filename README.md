
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

### Basic setup

```js

import plugin from 'myPlugin'

const pluginManager = new DsPlugin(plugin)

pluginManager.init({
  buildId: 1,
  plugins: [],
  additionalPlugins: [],
  isDev: true
})

```

### Add plugins

```js

const plugins = [
  
]

```

The **setupOnRequest** is used to run the setup function after the plugin has been requested to run by an action

The plugin itself is downloaded or imported but the plugins setup function is not run. the purpose of this is to avoid downloading any unnecessary external scripts until the plugin is actually used

There might be an issue with setupOptions being skipped

for example

```js
[DsPluginFirebaseStorage.name]: {
    name: DsPluginFirebaseStorage.name,
    plugin: DsPluginFirebaseStorage,
    onDemand: true
  }

```

### Add a remote plugin

This will add plugin metadata that allows the system to load the required version on request

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
