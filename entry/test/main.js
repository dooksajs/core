import createApp from '../../utils/createApp'
import dsConfig from 'dsConfig'
import buildTemplates from '../../utils/buildTemplates'
import page from '../../data/index.js'

const plugins = dsConfig.devDependencies ?? {}
const options = dsConfig.options ?? {}
const setup = dsConfig.setup ?? {}
const app = createApp(page, plugins, { ...options, setup })

window.dsApp = app
window.dsTemplates = {}

// build templates
if (dsConfig.templates) {
  const dsWidgetSectionId = page.widgets.entry[page.id][0]

  buildTemplates(app, dsConfig.templates)
    .then(templates => {
      for (let i = 0; i < templates.length; i++) {
        const template = templates[i]

        app.$method('dsWidget/insert', {
          dsWidgetSectionId,
          dsWidgetItem: template.item
        })
      }
    })
}
