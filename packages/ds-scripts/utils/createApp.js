import dsAppClient from '@dooksa/ds-app-client'
import dsDevTool from '@dooksa/ds-plugin-devtool'
import dsPlugin from '@dooksa/plugin'

// start app
export default (
  {
    dsApp = dsAppClient,
    plugins = []
  },
  options = {}
) => {
  plugins.push({
    name: dsDevTool.name,
    version: dsDevTool.version,
    value: dsDevTool,
    options
  }, {
    name: dsPlugin.name,
    version: dsPlugin.version,
    value: dsPlugin,
    options
  })

  dsApp.use(plugins)

  return dsApp.start({
    isDev: true,
    options
  })
}
