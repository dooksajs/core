import createPlugin from '@dooksa/create-plugin'
import { httpSetRoute } from './http.js'
import { dataAddListener, dataDeleteListener } from '@dooksa/plugins'
import { generateId } from '@dooksa/utils'

export default createPlugin('development', {
  models: {
    rebuildClient: {
      type: 'number'
    },
    rebuildServer: {
      type: 'number'
    }
  },
  setup () {
    // sse rebuild notification
    httpSetRoute({
      path: '/esbuild',
      handlers: [(request, response) => {
        response.writeHead(200, {
          'Content-Type': 'text/event-stream',
          Connection: 'keep-alive',
          'Cache-Control': 'no-cache'
        })

        // Retry connect every 10s
        response.write('retry: 10000\n\n')

        const id = generateId()
        dataAddListener({
          name: 'development/rebuildClient',
          on: 'update',
          handlerId: id,
          handler: (data) => {
            response.write('event: rebuild-client\n')
            response.write('data: ' + JSON.stringify(data) + '\n\n')
          }
        })

        dataAddListener({
          name: 'development/rebuildServer',
          on: 'update',
          handlerId: id,
          handler: (data) => {
            response.write('event: rebuild-client\n')
            response.write('data: ' + JSON.stringify(data) + '\n\n')
          }
        })

        // Close the connection when the client disconnects
        request.on('close', () => {
          dataDeleteListener({
            name: 'development/rebuildClient',
            on: 'update',
            handlerId: id
          })
          response.end('OK')
        })
      }]
    })
  }
})

