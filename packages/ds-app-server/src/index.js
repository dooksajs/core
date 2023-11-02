import createApp from '@dooksa/create-app'
import plugins from './plugins.js'

const dsApp = createApp()

// add plugins
dsApp.use(plugins)

export default dsApp
