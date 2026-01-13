import createApp from '@dooksa/create-app/server'
import { development } from '@dooksa/plugins/server'

export default async function createAppServer (options) {
  const app = createApp()

  app.usePlugin(development)

  // setup server
  return await app.setup({ options })
}
