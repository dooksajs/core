import createApp from '@dooksa/create-app/server'
import { development } from '@dooksa/plugins/server'
import actions from '@dooksa/actions'

export default function createAppServer (options) {
  const app = createApp({ actions })

  app.usePlugin(development)

  // setup server
  return app.setup({ options })
}
