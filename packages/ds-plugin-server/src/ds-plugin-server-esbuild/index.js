import { definePlugin } from '@dooksa/ds-app'

/**
 * @namespace dsEsbuild
 */
export default definePlugin({
  name: 'dsEsbuild',
  version: 1,
  data: {
    rebuildClient: {
      schema: {
        type: 'number'
      }
    }
  },
  setup () {
    // sse rebuild notification
    this.$setWebServerRoute('/esbuild', {
      method: 'get',
      handlers: [
        this._esbuild.bind(this)
      ]
    })
  },
  methods: {
    _esbuild (request, response) {
      response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache'
      })

      // Retry connect every 10s
      response.write('retry: 10000\n\n')

      const id = this.$method('dsData/generateId')
      this.$addDataListener('dsEsbuild/rebuildClient', {
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
        response.end('OK')
        this.$deleteDataListener('dsEsbuild/rebuildClient', {
          on: 'update',
          handlerId: id
        })
      })
    }
  }
})
