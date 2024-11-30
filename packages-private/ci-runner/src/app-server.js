import createApp from '@dooksa/create-app/server'

export default function createAppServer (options) {
  const app = createApp()

  // setup server
  return app.setup({ options })
}
