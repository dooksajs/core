
# Dooksa plugin management system 

Provides the ability for ds-app to add custom plugins

### Install dependencies

```
$ npm install
```

### Serve with hot reload at localhost:8080

```
$ npm run dev
<<<<<<< HEAD:packages/ds-plugin-event/README.md
```
=======
```

### Basic setup

Initialise the manager and include a plugin

```js

import DsPlugin from '@dooksa/ds-plugin'
import dsManager from '@dooksa/ds-plugin-manager'
import myPlugin from 'myPlugin'

const pluginManager = new DsPlugin(dsManager)

pluginManager.init({
  buildId: 1,
  plugins: [{
    name: myPlugin.name,
    version: myPlugin.version,
    plugin: myPlugin
  }],
  isDev: true
})

```

### Add plugins with options

Adding a plugin with options allows you to define arguments that the plugin's setup will receive

```js

const dsElement = {
  name: 'dsElement',
  version: 1,
  setup ({ appRootElementId }) {
    console.log(appRootElementId)
  }
}

const plugin = {
  name: dsElement.name,
  version: dsElement.version,
  plugin: dsElement,
  options: {
    setup: { 
      appRootElementId: 'app'
    }
  }
}

```

The **setupOnRequest** is used to run the setup function after the plugin has been requested to run by an action

The plugin itself is downloaded or imported but the plugins setup function is not run. the purpose of this is to avoid downloading any unnecessary external scripts until the plugin is actually used

There might be an issue with setupOptions being skipped

for example

```js

import dsModal from '@dooksa/ds-plugin-modal'

const plugin = {
  name: dsModal.name,
  version: dsModal.version,
  options: {
    setupOnRequest: true
  }
}

```

### Add a remote plugin

This will add plugin metadata that allows the system to load the required version on request

```js

const plugin {
  name: 'dsBootstrap',
  version: 1,
  options: {
    setupOnRequest: true,
    script: {
      src: `/plugins/ds-bootstrap/1/ds-bootstrap.js`,
      integrity: 'sha512-FV6gBFXtpWI8QiN+yCzueZTkzwcvfUOgpwOGrTmZDgTrx2I5/2K5mUOFAH73WGULrvehVJ3BiPL8EnDti25k1A=='
    }
  }
}
>>>>>>> ds-plugin-manager/master:README.md
