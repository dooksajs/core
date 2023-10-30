import createApp from '../../utils/createApp'
import dsConfig from 'dsConfig'
import buildTemplates from '../../utils/buildTemplates'

const plugins = dsConfig.devDependencies ?? { options: [], plugins: {} }
const options = dsConfig.options ?? {}
const setup = dsConfig.setup ?? {}

createApp(plugins, { ...options, setup }, {
  onSuccess (app) {
    window.dsDevTool = app

    // build templates
    if (dsConfig.templates) {
      const template = buildTemplates(dsConfig.templates, app.components)

      app.$setDataValue('dsAction/blocks', template.actions.blocks, {
        merge: true
      })

      app.$setDataValue('dsAction/sequences', template.actions.sequences, {
        merge: true
      })

      app.$setDataValue('dsAction/items', template.actions.items, {
        merge: true
      })

      for (let i = 0; i < template.elements.length; i++) {
        const element = template.elements[i]

        app.$action('dsTemplate/parseHTML', {
          html: element,
          actions: template.actionSequences
        },
        {
          onSuccess: (result) => {
            const dsSectionId = app.$method('dsTemplate/create', {
              id: result.id,
              mode: result.mode,
              language: result.lang
            })

            app.$action('dsSection/create', { dsSectionId })
          }
        })
      }
    }
  },
  onError (error) {
    console.log(error)
  }
})
