import DsPlugin from '@dooksa/ds-plugin'
import dsMetadata from '@dooksa/ds-plugin-metadata'
import dsAction from '@dooksa/ds-plugin-action'
import dsWidget from '@dooksa/ds-plugin-widget'
import dsElement from '@dooksa/ds-plugin-element'
import dsOperator from '@dooksa/ds-plugin-operator'
import dsEvent from '@dooksa/ds-plugin-event'
import dsParameter from '@dooksa/ds-plugin-parameter'
import dsRouter from '@dooksa/ds-plugin-router'
import dsComponent from '@dooksa/ds-plugin-component'
import dsLayout from '@dooksa/ds-plugin-layout'
import dsToken from '@dooksa/ds-plugin-token'
import dsManager from '@dooksa/ds-plugin-manager'
import dsPage from '@dooksa/ds-plugin-page'
import 'bootstrap/dist/css/bootstrap.css'

export default {
  DsPlugin,
  dsManager,
  plugins: {
    [dsMetadata.name]: {
      name: dsMetadata.name,
      version: dsMetadata.version,
      plugin: dsMetadata
    },
    [dsToken.name]: {
      name: dsToken.name,
      version: dsToken.version,
      plugin: dsToken
    },
    [dsRouter.name]: {
      name: dsRouter.name,
      version: dsRouter.version,
      plugin: dsRouter
    },
    [dsElement.name]: {
      name: dsElement.name,
      version: dsElement.version,
      plugin: dsElement
    },
    [dsComponent.name]: {
      name: dsComponent.name,
      version: dsComponent.version,
      plugin: dsComponent
    },
    [dsLayout.name]: {
      name: dsLayout.name,
      version: dsLayout.version,
      plugin: dsLayout
    },
    [dsWidget.name]: {
      name: dsWidget.name,
      version: dsWidget.version,
      plugin: dsWidget
    },
    [dsAction.name]: {
      name: dsAction.name,
      version: dsAction.version,
      plugin: dsAction
    },
    [dsEvent.name]: {
      name: dsEvent.name,
      version: dsEvent.version,
      plugin: dsEvent
    },
    [dsParameter.name]: {
      name: dsParameter.name,
      version: dsParameter.version,
      plugin: dsParameter
    },
    [dsOperator.name]: {
      name: dsOperator.name,
      version: dsOperator.version,
      plugin: dsOperator
    },
    [dsPage.name]: {
      name: dsPage.name,
      version: dsPage.version,
      plugin: dsPage
    },
    dsParse: {
      name: 'dsParse',
      version: 1,
      options: {
        import: 'ds-plugin-parse',
        setupOnRequest: true
      }
    },
    dsDatabase: {
      name: 'dsDatabase',
      version: 1,
      options: {
        import: 'ds-plugin-database',
        setupOnRequest: true
      }
    },
    dsTemplate: {
      name: 'dsTemplate',
      version: 1,
      options: {
        import: 'ds-plugin-template',
        setupOnRequest: true
      }
    },
    dsUtilities: {
      name: 'dsUtilities',
      version: 1,
      options: {
        import: 'ds-plugin-utilities',
        setupOnRequest: true
      }
    }
  },
  use (plugin = {}, options = {}) {
    const item = {
      name: plugin.name,
      version: plugin.version,
      options
    }

    if (!options.import) {
      item.plugin = plugin
    }

    // ISSUE: add plugin schema checks
    this.plugins[plugin.name] = item
  },
  init ({ prefetchedPage, assetsURL, isDev, rootElementId = 'app' }) {
    const pluginManager = new this.DsPlugin(this.dsManager, [], isDev)

    // core plugins options
    this.plugins[dsElement.name].options = {
      setup: { rootElementId }
    }
    this.plugins[dsPage.name].options = {
      setup: { prefetchedPage }
    }

    // start dooksa
    return pluginManager.init({
      build: 1,
      plugins: this.plugins,
      DsPlugin: this.DsPlugin,
      isDev
    })
  }
}
