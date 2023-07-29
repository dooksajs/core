import createApp from '@dooksa/create-app'
import plugins from './plugins.js'

const dsApp = createApp()

// add plugins
for (let i = 0; i < plugins.length; i++) {
  const plugin = plugins[i]

  dsApp.use(plugin)
}

export default dsApp
