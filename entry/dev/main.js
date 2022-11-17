import createApp from '../../utils/createApp'
import dsTemplates from 'dsTemplates'
import buildTemplates from '../../utils/buildTemplates'
import page from '../../data/index.js'

const app = createApp(page)

window.dsDevTool = app

// build templates
if (dsTemplates) {
  const sectionId = page.widgets.head[page.id][0]

  buildTemplates(app, dsTemplates)
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
