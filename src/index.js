import DsPlugin from '../../ds-plugin/src/index.js'
import dsMetadata from '../../ds-plugin-metadata/src/index.js'
import dsAction from '../../ds-plugin-action/src/index.js'
import dsWidget from '../../ds-plugin-widget/src/index.js'
import dsElement from '../../ds-plugin-element/src/index.js'
import dsOperators from '../../ds-plugin-operators/src/index.js'
import dsEvent from '../../ds-plugin-event/src/index.js'
import dsParameters from '../../ds-plugin-params/src/index.js'
import dsUtilities from '../../ds-plugin-utilities/src/index.js'
import dsRouter from '../../ds-plugin-router/src/index.js'
import dsComponent from '../../ds-plugin-component/src/index.js'
import dsLayout from '../../ds-plugin-layout/src/index.js'
import dsToken from '../../ds-plugin-tokens/src/index.js'
import dsManager from '../../ds-plugin-manager/src/index.js'
import dsPage from '../../ds-plugin-page/src/index.js'

export default {
  plugins: [],
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
    this.plugins.push(item)
  },
  init ({ prefetchedPage, assetsURL, isDev, rootElementId = 'app' }) {
    const pluginManager = new DsPlugin(dsManager)
    // Core plugins
    const plugins = [
      {
        name: dsMetadata.name,
        version: dsMetadata.version,
        plugin: dsMetadata
      },
      {
        name: dsToken.name,
        version: dsToken.version,
        plugin: dsToken
      },
      {
        name: dsRouter.name,
        version: dsRouter.version,
        plugin: dsRouter
      },
      {
        name: dsComponent.name,
        version: dsComponent.version,
        plugin: dsComponent
      },
      {
        name: dsLayout.name,
        version: dsLayout.version,
        plugin: dsLayout
      },
      {
        name: dsWidget.name,
        version: dsWidget.version,
        plugin: dsWidget
      },
      {
        name: dsAction.name,
        version: dsAction.version,
        plugin: dsAction
      },
      {
        name: dsEvent.name,
        version: dsEvent.version,
        plugin: dsEvent
      },
      {
        name: dsParameters.name,
        version: dsParameters.version,
        plugin: dsParameters
      },
      {
        name: dsOperators.name,
        version: dsOperators.version,
        plugin: dsOperators
      },
      {
        name: dsUtilities.name,
        version: dsUtilities.version,
        plugin: dsUtilities
      },
      {
        name: dsElement.name,
        version: dsElement.version,
        plugin: dsElement,
        options: {
          setup: { rootElementId }
        }
      },
      {
        name: dsPage.name,
        version: dsPage.version,
        plugin: dsPage,
        options: {
          setup: { prefetchedPage }
        }
      },
      ...this.plugins
    ]

    return pluginManager.init({
      build: 1,
      plugins,
      DsPlugin,
      isDev
    })
  }
}
