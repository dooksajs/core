import { createPlugin } from '@dooksa/create-plugin'
import { httpSetRoute } from './http.js'
import { stateAddListener, stateDeleteListener } from '../client/index.js'
import { generateId } from '@dooksa/utils'

export const development = createPlugin('development', {
  state: {
    schema: {
      rebuild: {
        type: 'number'
      }
    }
  },
  setup () {
    // sse rebuild route
    httpSetRoute({
      path: '/esbuild',
      handlers: [(request, response) => {
        // no cache
        response.setHeader('Surrogate-Control', 'no-store')
        response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        response.setHeader('Expires', '0')

        // SSE headers
        response.setHeader('Content-Type', 'text/event-stream')
        response.setHeader('Connection', 'keep-alive')

        // send initial connection message
        response.write('data: Connected\n\n')

        const handlerId = generateId()

        // emit client rebuild data
        stateAddListener({
          name: 'development/rebuild',
          on: 'update',
          handlerId,
          handler: (data) => {
            response.write(`data: Message ${JSON.stringify(data)}\n\n`)
          }
        })

        // close the connection when the client disconnects
        response.once('close', () => {
          // delete client/server rebuild data listeners
          stateDeleteListener({
            name: 'development/rebuild',
            on: 'update',
            handlerId
          })
        })
      }]
    })
  }
})

