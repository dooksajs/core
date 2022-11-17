import dsApp from '@dooksa/ds-app'
import dsDevTool from '@dooksa-extra/ds-plugin-devtool'
import currentDsPlugin from '@dooksa/plugin'
import dsDependencies from 'dsDependencies'
import dsTemplates from 'dsTemplates'
import bootstrapPage from '../../data/index.js'
import dsParse from '@dooksa-extra/ds-plugin-parse'

let app = dsApp

if (dsDependencies.dsApp) {
  app = dsDependencies.dsApp

  delete dsDependencies.dsApp
}

if (dsDependencies.DsPlugin) {
  app.DsPlugin = dsDependencies.DsPlugin

  delete dsDependencies.DsPlugin
}

if (dsDependencies.dsManager) {
  app.dsManager = dsDependencies.dsManager

  delete dsDependencies.dsManager
}

const plugins = {
  dsDevTool,
  dsParse,
  ...dsDependencies,
  [currentDsPlugin.name]: currentDsPlugin
}

// load the plugin and dependencies
for (const key in plugins) {
  if (Object.prototype.hasOwnProperty.call(plugins, key)) {
    app.use(plugins[key], { setupOnRequest: true })
  }
}

// start app
const dooksa = app.init({
  appRootElementId: 'app',
  isDev: true,
  prefetchedPage: bootstrapPage
})

window.dsDevTool = dooksa

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
          const item = dooksa.$method('dsParse/toActionSequence', items)

          dooksa.$method('dsAction/set', item)
          // assign the method to a action sequenceId
          metadata.actions = { ...metadata.actions, [key]: item.sequence.id }

          if (item.params) {
            dooksa.$method('dsParameter/set', item.params)
          }
        }
      }
    }

    dooksa.$action('dsParse/toWidget',
      {
        rootElement: templateElement.content,
        isTemplate: true,
        metadata
      },
      {
        onSuccess: (item) => {
          dooksa.$action('dsTemplate/set',
            { id: metadata.id, item },
            {
              onSuccess: () => {
                dooksa.$method('dsWidget/insert', {
                  id: sectionId,
                  item: {
                    layout: {
                      default: {
                        id: dooksa.$method('dsUtilities/generateId'),
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
