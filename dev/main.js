import dsApp from '@dooksa/ds-app'
import dsDevTool from '@dooksa-extra/ds-plugin-devtool'
import dsPlugin from '@dooksa/plugin'
import dsDependencies from 'dsDependencies'
import dsTemplates from 'dsTemplates'
import bootstrapPage from '../data/index.js'
import dsParse from '@dooksa-extra/ds-plugin-parse'

const plugins = {
  dsApp,
  dsDevTool,
  dsPlugin,
  dsParse,
  ...dsDependencies
}

// load the plugin and dependencies
for (const key in plugins) {
  if (Object.prototype.hasOwnProperty.call(plugins, key)) {
    if (key !== 'dsApp') {
      plugins.dsApp.use(plugins[key], { setupOnRequest: true })
    }
  }
}

// force utilities to load
dsApp.plugins.dsParse = {
  name: dsParse.name,
  version: dsParse.version,
  plugin: dsParse
}

// start app
const app = plugins.dsApp.init({
  appRootElementId: 'app',
  isDev: true,
  prefetchedPage: bootstrapPage
})

window.dsDevTool = app

// build templates
if (dsTemplates) {
  // Need to find a better way to find a section and its parent element
  const sectionId = bootstrapPage.widgets.head[bootstrapPage.id][0]

  for (let i = 0; i < dsTemplates.length; i++) {
    const template = dsTemplates[i]
    const div = document.createElement('div')

    div.innerHTML = template

    const templateScript = div.querySelector('script')
    const templateElement = div.querySelector('template')

    if (!templateScript) {
      console.error(dsTemplates, 'is missing <script> tag')
      break
    }

    const metadata = new Function(templateScript.textContent)() // eslint-disable-line

    if (metadata.methods) {
      for (const key in metadata.methods) {
        if (Object.hasOwnProperty.call(metadata.methods, key)) {
          const items = metadata.methods[key]
          const item = app.$method('dsParse/toActionSequence', items)

          app.$method('dsAction/set', item)
          // assign the method to a action sequenceId
          metadata.actions = { ...metadata.actions, [key]: item.sequence.id }

          if (item.params) {
            app.$method('dsParameter/set', item.params)
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
          console.log(item)
          app.$action('dsTemplate/set',
            { id: metadata.id, item },
            {
              onSuccess: () => {
                app.$method('dsWidget/insert', {
                  id: sectionId,
                  item: {
                    layout: {
                      default: {
                        id: app.$method('dsUtilities/generateId'),
                        templateId: metadata.id
                      }
                    }
                  }
                })
              }
            })
        },
        onError: (result) => console.log(result)
      }
    )
  }
}
