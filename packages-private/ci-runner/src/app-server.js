import createApp from '@dooksa/create-app/server'

export default async function createAppServer (options) {
  const app = createApp()

  // setup server
  return await app.setup({ options })
}
