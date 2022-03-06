import DsPlugin from '@dooksa/ds-plugin'
import dsAction from '../../ds-plugin-action'
import dsWidget from '../../ds-plugin-widget'
import dsElement from '../../ds-plugin-element'
import dsContent from '../../ds-plugin-content'
import dsOperators from '../../ds-plugin-operators'
import dsEvent from '../../ds-plugin-event'
import dsParameters from '../../ds-plugin-params'
import dsUtilities from '../../ds-plugin-utilities'
import dsRouter from '../../ds-plugin-router'
import dsManager from '../../ds-plugin-manager'
import dsApp from '../src/app'

// Core plugins
const plugins = [
  {
    item: {
      name: dsRouter.name,
      version: dsRouter.version
    },
    plugin: dsRouter,
    options: {
      setupOnRequest: false
    }
  },
  {
    item: {
      name: dsWidget.name,
      version: dsWidget.version
    },
    plugin: dsWidget,
    options: {
      setupOnRequest: false
    }
  },
  {
    item: {
      name: dsElement.name,
      version: dsElement.version
    },
    plugin: dsElement,
    options: {
      setupOnRequest: false
    }
  },
  {
    item: {
      name: dsContent.name,
      version: dsContent.version
    },
    plugin: dsContent,
    options: {
      setupOnRequest: false
    }
  },
  {
    item: {
      name: dsAction.name,
      version: dsAction.version
    },
    plugin: dsAction,
    options: {
      setupOnRequest: false
    }
  },
  {
    item: {
      name: dsEvent.name,
      version: dsEvent.version
    },
    plugin: dsEvent,
    options: {
      setupOnRequest: false
    }
  },
  {
    item: {
      name: dsParameters.name,
      version: dsParameters.version
    },
    plugin: dsParameters,
    options: {
      setupOnRequest: false
    }
  },
  {
    item: {
      name: dsOperators.name,
      version: dsOperators.version
    },
    plugin: dsOperators,
    options: {
      setupOnRequest: false
    }
  },
  {
    item: {
      name: dsUtilities.name,
      version: dsUtilities.version,
      setupOptions: {
        docId: {
          alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
          alphabetLength: 20
        },
        instanceId: {
          alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
          alphabetLength: 17
        }
      }
    },
    plugin: dsUtilities,
    options: {
      setupOnRequest: false
    }
  }
]

export default {
  plugins: {},
  init ({ appCache, appElement, assetsURL }) {
    const pluginManager = new DsPlugin(dsManager)

    plugins.push({
      item: {
        name: dsApp.name,
        version: dsApp.version,
        setupOptions: {
          appCache,
          appElement,
          assetsURL
        }
      },
      plugin: dsApp,
      options: {
        setupOnRequest: false
      }
    })

    pluginManager.init({
      build: 1,
      plugins,
      isDev: true
    })
  }
}
