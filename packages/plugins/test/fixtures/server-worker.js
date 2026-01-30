import { parentPort } from 'worker_threads'
import { server, database } from '#server'
import { state } from '#core'
import { createPlugin } from '@dooksa/create-plugin'
import { mockStateData } from '@dooksa/test'

async function run () {
  parentPort.on('message', async (message) => {
    switch (message.status) {
      case 'start':
        const serverInfo = await setupServer({
          routes: message.routes,
          data: message.data,
          plugins: message.plugins
        })

        parentPort.postMessage({
          status: 'ready',
          ...serverInfo
        })
        break

      case 'restore':
        await server.serverStop()
        state.restore()
        database.restore()
        server.restore()

        parentPort.postMessage({
          status: 'restored'
        })
        break

      case 'shutdown':
        await server.serverStop()
        process.exit(0)
        break
    }
  })
}

async function setupServer ({ routes = [], data = [], plugins = [] }) {
  if (!plugins.length) {
    plugins.push(createPlugin('user', {
      state: {
        schema: {
          profiles: {
            type: 'collection',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' }
              }
            }
          }
        }
      }
    }))
  }

  plugins.push(server)

  // Setup state and server
  const stateExport = mockStateData(plugins)
  state.setup(stateExport)
  server.setup()

  // Configure routes
  for (const route of routes) {
    server.serverSetRoute({
      path: route,
      middleware: ['request/queryIdIsArray'],
      handlers: [database.databaseGetValue([route])]
    })
  }

  // Set state data
  for (const item of data) {
    state.stateSetValue({
      name: item.name,
      value: item.value,
      options: { replace: true }
    })
  }

  return await server.serverStart({ port: 0 })
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
