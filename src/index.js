import DsPlugin from '@dooksa/ds-plugin'
import dsAction from '../../ds-plugin-action'
import dsLayout from '../../ds-plugin-layout'
import dsElement from '../../ds-plugin-element'
import dsContent from '../../ds-plugin-content'
import dsOperators from '../../ds-plugin-operators'
import dsEvents from '../../ds-plugin-event'
import dsParameters from '../../ds-plugin-params'
import dsUtilities from '../../ds-plugin-utilities'
import dsApp from './app'

// Core plugins
const plugins = [
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
      name: dsEvents.name,
      version: dsEvents.version
    },
    plugin: dsEvents,
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
      name: dsApp.name,
      version: dsApp.version
    },
    plugin: dsApp,
    options: {
      setupOnRequest: false
    }
  }
]

const pluginManager = new DsPlugin(dsApp)

pluginManager.init({
  buildId: 1,
  plugins,
  isDev: true
})

console.log(pluginManager)
