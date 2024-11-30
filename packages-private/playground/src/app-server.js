import createApp from '@dooksa/create-app/server'
import { development } from '@dooksa/plugins/server'

export default function createAppServer (options) {
  const app = createApp()

  app.usePlugin(development)

  // setup server
  return app.setup({ options })
}
