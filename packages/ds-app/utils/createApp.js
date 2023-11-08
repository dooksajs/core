import dsApp from '@dooksa/ds-app-client'
// import dsDevTool from '@dooksa/ds-plugin-devtool'
import dsPlugin from '@dooksa/plugin'

export default (plugins = [], options = {}, callback) => {
  const app = dsApp()

  for (let i = 0; i < plugins.length; i++) {
    const plugin = plugins[i]

    app.use({
      name: plugin.name,
      version: plugin.version,
      value: plugin
    })
  }

  // add current dev plugin
  app.use({
    name: dsPlugin.name,
    version: dsPlugin.version,
    value: dsPlugin
  })

  app.start({
    isDev: true,
    options
  }, callback)
}
