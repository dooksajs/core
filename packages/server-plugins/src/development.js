import createPlugin from '@dooksa/create-plugin'
import { $setRoute } from './http.js'
import { $addDataListener, $deleteDataListener, dataGenerateId } from '@dooksa/plugins'

export default createPlugin({
  name: 'development',
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
    $setRoute('/esbuild', {
      method: 'get',
      handlers: [(request, response) => {
        response.writeHead(200, {
          'Content-Type': 'text/event-stream',
          Connection: 'keep-alive',
          'Cache-Control': 'no-cache'
        })

        // Retry connect every 10s
        response.write('retry: 10000\n\n')

        const id = dataGenerateId()
        $addDataListener('development/rebuildClient', {
          on: 'update',
          handler: {
            id,
            value: (data) => {
              response.write('event: rebuild-client\n')
              response.write('data: ' + JSON.stringify(data) + '\n\n')
            }
          }
        })

        $addDataListener('development/rebuildServer', {
          on: 'update',
          handler: {
            id,
            value: (data) => {
              response.write('event: rebuild-client\n')
              response.write('data: ' + JSON.stringify(data) + '\n\n')
            }
          }
        })

        // Close the connection when the client disconnects
        request.on('close', () => {
          $deleteDataListener('development/rebuildClient', {
            on: 'update',
            handlerId: id
          })
          response.end('OK')
        })
      }]
    })
  }
})

