import DsPlugin from '@dooksa/ds-plugin'
import dsData from '@dooksa/ds-plugin-data'
import dsMetadata from '@dooksa/ds-plugin-metadata'
import dsAction from '@dooksa/ds-plugin-action'
import dsWidget from '@dooksa/ds-plugin-widget'
import dsOperator from '@dooksa/ds-plugin-operator'
import dsEvent from '@dooksa/ds-plugin-event'
import dsRouter from '@dooksa/ds-plugin-router'
import dsComponent from '@dooksa/ds-plugin-component'
import dsLayout from '@dooksa/ds-plugin-layout'
import dsToken from '@dooksa/ds-plugin-token'
import dsManager from '@dooksa/ds-plugin-manager'
import dsPage from '@dooksa/ds-plugin-page'
import dsView from '@dooksa/ds-plugin-view'
import dsContent from '@dooksa/ds-plugin-content'
import 'bootstrap/dist/css/bootstrap.css'

export default {
  DsPlugin,
  dsManager,
  plugins: {
    [dsData.name]: {
      name: dsData.name,
      version: dsData.version,
      plugin: dsData
    },
    [dsMetadata.name]: {
      name: dsMetadata.name,
      version: dsMetadata.version,
      plugin: dsMetadata
    },
    [dsAction.name]: {
      name: dsAction.name,
      version: dsAction.version,
      plugin: dsAction
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
    [dsComponent.name]: {
      name: dsComponent.name,
      version: dsComponent.version,
      plugin: dsComponent
    },
    [dsView.name]: {
      name: dsView.name,
      version: dsView.version,
      plugin: dsView
    },
    [dsContent.name]: {
      name: dsContent.name,
      version: dsContent.version,
      plugin: dsContent
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
    [dsEvent.name]: {
      name: dsEvent.name,
      version: dsEvent.version,
      plugin: dsEvent
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
  init ({ dsPage, assetsURL, isDev, rootElementId = 'app' }) {
    const pluginManager = new this.DsPlugin(this.dsManager, [], isDev)

    if (dsPage) {
      if (this.plugins.dsPage.options) {
        if (this.plugins.dsPage.options.setup) {
          this.plugins.dsPage.options = { ...this.plugins.dsPage.options.setup, dsPage }
        } else {
          this.plugins.dsPage.options = { ...this.plugins.dsPage.options, setup: { dsPage } }
        }
      } else {
        this.plugins.dsPage.options = {
          setup: { dsPage }
        }
      }
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
