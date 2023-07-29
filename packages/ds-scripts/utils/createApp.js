import dsAppClient from '@dooksa/ds-app-client'
import dsDevTool from '@dooksa/ds-plugin-devtool'
import dsTemplate from '@dooksa/ds-plugin-template'
import dsPlugin from '@dooksa/plugin'

// start app
export default (
  {
    dsApp = dsAppClient,
    plugins = []
  },
  options = {}
) => {
  dsApp.use({
    name: dsDevTool.name,
    version: dsDevTool.version,
    plugin: dsDevTool,
    options
  })
  dsApp.use({
    name: dsTemplate.name,
    version: dsTemplate.version,
    plugin: dsTemplate,
    options
  })

  // load the plugin and dependencies
  for (let i = 0; i < plugins.length; i++) {
    const item = plugins[i]
    const options = item.options || {}

    dsApp.use(item.plugin, options)
  }

  dsApp.use({
    name: dsPlugin.name,
    version: dsPlugin.version,
    plugin: dsPlugin,
    options
  })

  return dsApp.start({
    isDev: true,
    options
  })
}
