import createApp from '../../utils/createApp'
import dsConfig from 'dsConfig'
import buildTemplates from '../../utils/buildTemplates'

const plugins = dsConfig.devDependencies ?? { options: [], plugins: {} }
const options = dsConfig.options ?? {}
const setup = dsConfig.setup ?? {}
const app = createApp(plugins, { ...options, setup })

window.dsDevTool = app

// build templates
if (dsConfig.templates) {
  const template = buildTemplates(dsConfig.templates, app.components)

  app.$setDataValue('dsAction/items', {
    source: template.actions.items,
    options: {
      source: {
        merge: true
      }
    }
  })

  app.$setDataValue('dsAction/sequence', {
    source: template.actions.sequence,
    options: {
      source: {
        merge: true
      }
    }
  })

  app.$setDataValue('dsAction/sequenceEntry', {
    source: template.actions.sequenceEntry,
    options: {
      source: {
        merge: true
      }
    }
  })

  const dsSections = []
  const widgetLoaded = []

  for (let i = 0; i < template.elements.length; i++) {
    const element = template.elements[i]
    const result = app.$method('dsTemplate/parseHTML', {
      html: element,
      actions: template.actionSequenceRef
    })

    const dsSectionId = app.$method('dsTemplate/create', {
      id: result.id,
      mode: result.mode,
      language: result.lang
    })

    dsSections.push(dsSectionId)

    widgetLoaded.push(new Promise(resolve => {
      app.$action('dsSection/create', { dsSectionId }, {
        onSuccess: () => resolve()
      })
    }))
  }

  app.$setDataValue('dsPage/sectionEntry', {
    source: dsSections,
    options: {
      id: app.$method('dsRouter/currentPath')
    }
  })

  Promise.all(widgetLoaded).then(() => {
    app.$action('dsPage/save')
  })
}
