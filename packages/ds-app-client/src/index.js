import createApp from '@dooksa/create-app'
import plugins from './plugins.js'

const dsApp = createApp()

dsApp.use(plugins)

export default dsApp
