import DsPlugin from '@dooksa/ds-plugin'
import DsPluginTokens from '../../ds-plugin-tokens'
import DsPluginOperators from '../../ds-plugin-operators'
import DsPluginEvents from '../../ds-plugin-event'
import DsPluginWorkflow from '../../ds-plugin-workflow'
import DsPluginParameters from '../../ds-plugin-params'
import DsPluginUtilities from '../../ds-plugin-utilities'
import plugin from 'plugin'

// these are part of the app build
const plugins = [
  {
    item: {
      name: DsPluginWorkflow.name,
      version: DsPluginWorkflow.version
    },
    plugin: DsPluginWorkflow,
    options: {
      setupOnRequest: false
    }
  },
  {
    item: {
      name: DsPluginEvents.name,
      version: DsPluginEvents.version
    },
    plugin: DsPluginEvents,
    options: {
      setupOnRequest: false
    }
  },
  {
    item: {
      name: DsPluginParameters.name,
      version: DsPluginParameters.version
    },
    plugin: DsPluginParameters,
    options: {
      setupOnRequest: false
    }
  },
  {
    item: {
      name: DsPluginTokens.name,
      version: DsPluginTokens.version
    },
    plugin: DsPluginTokens,
    options: {
      setupOnRequest: false
    }
  },
  {
    item: {
      name: DsPluginOperators.name,
      version: DsPluginOperators.version
    },
    plugin: DsPluginOperators,
    options: {
      setupOnRequest: false
    }
  },
  {
    item: {
      name: DsPluginUtilities.name,
      version: DsPluginUtilities.version
    },
    plugin: DsPluginUtilities,
    options: {
      setupOnRequest: false
    }
  },
  {
    item: {
      name: 'dsContent',
      version: 1,
      script: {
        src: '/ds-content-1.0.0.js',
        integrity: 'sha512-z5UgOiTBL4qHC08JHij7jkWr88NaQCioZ76gtJZzzY0VNtu0rPTfHl1h5hGzledJT3FOv0b1ReNw7eLu+5au0w=='
      }
    },
    options: {
      setupOnRequest: false,
      onDemand: true
    }
  }
]

const additionalPlugins = [
  {
    item: {
      name: 'dsTextEditor',
      version: 1,
      script: {
        src: '/ds-text-editor-1.js',
        integrity: 'sha512-FrkBOYWlLYD88oi0TyNZ78ETqifG6Wvbh6TLeWzNnDFnm9yexG9lFVZoSGOqUe5aMTsVdM2WeqXhp5aW+44xtw=='
      }
    },
    options: {
      onDemand: true,
      setupOnRequest: false
    }
  }
]

const pluginManager = new DsPlugin(plugin)

pluginManager.init({
  buildId: 1,
  plugins,
  additionalPlugins,
  isDev: true
})

console.log(pluginManager)
