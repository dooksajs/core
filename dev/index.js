import DsPlugin from '../../ds-plugin'
import dsMetadata from '../../ds-plugin-metadata'
import dsAction from '../../ds-plugin-action'
import dsWidget from '../../ds-plugin-widget'
import dsElement from '../../ds-plugin-element'
import dsOperators from '../../ds-plugin-operators'
import dsEvent from '../../ds-plugin-event'
import dsParameters from '../../ds-plugin-params'
import dsUtilities from '../../ds-plugin-utilities'
import dsRouter from '../../ds-plugin-router'
import dsComponent from '../../ds-plugin-component'
import dsLayout from '../../ds-plugin-layout'
import dsTemplate from '../../ds-plugin-template'
import dsDevTool from '../../ds-plugin-dev-tool'
import dsManager from '../../ds-plugin-manager'
import dsApp from '../src/app'

// Core plugins
const plugins = [
  {
    item: {
      name: dsMetadata.name,
      version: dsMetadata.version
    },
    plugin: dsMetadata,
    options: {
      setupOnRequest: false
    }
  },
  {
    item: {
      name: dsDevTool.name,
      version: dsDevTool.version
    },
    plugin: dsDevTool,
    options: {
      setupOnRequest: false
    }
  },
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
      name: dsComponent.name,
      version: dsComponent.version
    },
    plugin: dsComponent,
    options: {
      setupOnRequest: false
    }
  },
  {
    item: {
      name: dsLayout.name,
      version: dsLayout.version
    },
    plugin: dsLayout,
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
      version: dsUtilities.version
    },
    plugin: dsUtilities,
    options: {
      setupOnRequest: false
    }
  },
  {
    item: {
      name: dsTemplate.name,
      version: dsTemplate.version
    },
    plugin: dsTemplate,
    options: {
      setupOnRequest: false
    }
  }
]

export default {
  plugins: {},
  init ({ appCache, assetsURL, isDev }) {
    const pluginManager = new DsPlugin(dsManager)

    plugins.push({
      item: {
        name: dsApp.name,
        version: dsApp.version,
        setupOptions: {
          appCache,
          assetsURL
        }
      },
      plugin: dsApp,
      options: {
        setupOnRequest: false
      }
    })

    return pluginManager.init({
      build: 1,
      plugins,
      DsPlugin,
      isDev
    })
  }
}
