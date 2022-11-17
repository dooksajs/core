import createApp from '../../utils/createApp'
import dsTemplates from 'dsTemplates'
import buildTemplates from '../../utils/buildTemplates'
import page from '../../data/index.js'

const app = createApp(page)

window.dsApp = app
window.dsTemplates = {}

// build templates
if (dsTemplates) {
  buildTemplates(app, dsTemplates)
    .then(templates => {
      window.dsTemplates = {
        sectionId: page.widgets.head[page.id][0],
        items: templates
      }
    })
}
