import createApp from '../../utils/createApp'
import dsConfig from 'dsConfig'
import buildTemplates from '../../utils/buildTemplates'
import page from '../../data/index.js'

const app = createApp(page, dsConfig.devDependencies, dsConfig.setup)

window.dsDevTool = app

// build templates
if (dsConfig.templates) {
  const sectionId = page.widgets.head[page.id][0]

  buildTemplates(app, dsConfig.templates)
    .then(templates => {
      for (let i = 0; i < templates.length; i++) {
        const template = templates[i]

        app.$method('dsWidget/insert', {
          id: sectionId,
          item: template.item
        })
      }
    })
}
