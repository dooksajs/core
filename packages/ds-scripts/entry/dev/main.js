import createApp from '../../utils/createApp'
import dsConfig from 'dsConfig'
import buildTemplates from '../../utils/buildTemplates'
import page from '../../data/index.js'

const plugins = dsConfig.devDependencies ?? { options: [], plugins: {} }
const options = dsConfig.options ?? {}
const setup = dsConfig.setup ?? {}
const app = createApp(page, plugins, { ...options, setup })

window.dsDevTool = app

// build templates
if (dsConfig.templates) {
  const template = buildTemplates(dsConfig.templates, app.components)

  for (let i = 0; i < template.elements.length; i++) {
    const element = template.elements[i]
    const result = app.$method('dsTemplate/parseHTML', {
      html: element,
      actions: template.actionSequenceRef
    })

    const dsWidgetSectionId = app.$method('dsTemplate/create', {
      id: result.id,
      mode: result.mode,
      language: result.lang
    })

    app.$action('dsWidget/create', { dsWidgetSectionId })
  }
}
