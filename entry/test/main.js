import createApp from '../../utils/createApp'
import dsConfig from 'dsConfig'
import buildTemplates from '../../utils/buildTemplates'
import page from '../../data/index.js'

const plugins = dsConfig.devDependencies ?? {}
const setupOptions = dsConfig.setup ?? {}
const app = createApp(page, plugins, setupOptions)

window.dsApp = app
window.dsTemplates = {}

// build templates
if (dsConfig.templates) {
  buildTemplates(app, dsConfig.templates)
    .then(templates => {
      window.dsTemplates = {
        sectionId: page.widgets.entry[page.id][0],
        items: templates
      }
    })
}
