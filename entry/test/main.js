import createApp from '../../utils/createApp'
import dsConfig from 'dsConfig'
import buildTemplates from '../../utils/buildTemplates'
import page from '../../data/index.js'

const app = createApp(page, dsConfig.devDependencies, dsConfig.setup)

window.dsApp = app
window.dsTemplates = {}

// build templates
if (dsConfig.templates) {
  buildTemplates(app, dsConfig.templates)
    .then(templates => {
      window.dsTemplates = {
        sectionId: page.widgets.head[page.id][0],
        items: templates
      }
    })
}
