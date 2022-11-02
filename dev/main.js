import dsApp from '@dooksa/ds-app'
import dsDevTool from '@dooksa/ds-plugin-dev-tool'
import dsPlugin from '@dooksa/plugin'
import dsPluginDeps from '@dooksa/plugin-dependencies'
import dsPluginTemplates from '@dooksa/plugin-templates'
import bootstrapPage from '../data/index.js'
import dsParse from '@dooksa-extra/ds-plugin-parse'

const plugins = {
  dsPlugin,
  ...dsPluginDeps
}

// load the plugin and dependencies
for (const key in plugins) {
  if (Object.prototype.hasOwnProperty.call(plugins, key)) {
    dsApp.use(plugins[key], { setupOnRequest: true })
  }
}

dsApp.use(dsDevTool)

// force utilities to load
dsApp.plugins.dsParse = {
  name: dsParse.name,
  version: dsParse.version,
  plugin: dsParse
}

// start app
const app = dsApp.init({
  appRootElementId: 'app',
  isDev: true,
  prefetchedPage: bootstrapPage
})

window.dsDevTool = app

// build templates
if (dsPluginTemplates) {
  // Need to find a better way to find a section and its parent element
  const sectionId = bootstrapPage.widgets.head[bootstrapPage.id][0]

  for (let i = 0; i < dsPluginTemplates.length; i++) {
    const template = dsPluginTemplates[i];
    const div = document.createElement('div')

    div.innerHTML = template.html

    const templateScript = div.querySelector('script').textContent
    const templateElement = div.querySelector('template')
    const metadata = new Function(templateScript)();

    if (metadata.methods) {
      for (const key in metadata.methods) {
        if (Object.hasOwnProperty.call(metadata.methods, key)) {
          const items = metadata.methods[key]
          const item = app.$method('dsParse/toActionSequence', items)

          app.$method('dsAction/set', item)
          // assign the method to a action sequenceId
          metadata.actions = { ...metadata.actions, [key]: item.sequence.id }

          if (item.params) {
            app.$method('dsParameters/set', item.params)
          }
        }
      }
    }

    app.$action('dsParse/toWidget',
      { 
        rootElement: templateElement.content,
        isTemplate: true,
        metadata
      },
      {
        onSuccess: (item) => {
          app.$action('dsTemplate/set',
            { id: template.name, item },
            { onSuccess: () => {
              app.$method('dsWidget/insert', {
                id: sectionId,
                item: {
                  layout: {
                    default: {
                      id: app.$method('dsUtilities/generateId'),
                      templateId: template.name
                    }
                  }
                }
              })
            }})
        },
        onError: (result) => console.log(result),
      }
    )
  }
}
