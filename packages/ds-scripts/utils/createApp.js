import dsApp from '@dooksa/ds-app-client'
// import dsDevTool from '@dooksa/ds-plugin-devtool'
import dsPlugin from '@dooksa/plugin'

export default () => {
  // add current dev plugin
  dsApp.use({
    name: dsPlugin.name,
    version: dsPlugin.version,
    value: dsPlugin
  })

  return dsApp.start({
    isDev: true
  })
}
