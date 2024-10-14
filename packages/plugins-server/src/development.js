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
  data: {
    sse_streams: {}
  },
  setup () {
    // sse rebuild notification
    httpSetRoute({
      path: '/esbuild',
      handlers: [(request, response) => {
        if (!response.sse) {
          return response.send('Server-Sent Events Not Supported!')
        }

        // open sse stream
        response.sse.send()

        const id = generateId()

        // assign a unique identifier to this stream and store it in our broadcast pool
        response.sse.id = id
        this.sse_streams[id] = response.sse

        // emit client rebuild data
        dataAddListener({
          name: 'development/rebuildClient',
          on: 'update',
          handlerId: id,
          handler: (data) => {
            response.sse.send(id, 'rebuild-client', JSON.stringify(data))
          }
        })

        // emit server rebuild data
        dataAddListener({
          name: 'development/rebuildServer',
          on: 'update',
          handlerId: id,
          handler: (data) => {
            response.sse.send(id, 'rebuild-server', JSON.stringify(data))
          }
        })

        // close the connection when the client disconnects
        response.once('close', () => {
          // delete client/server rebuild data listeners
          dataDeleteListener({
            name: 'development/rebuildClient',
            on: 'update',
            handlerId: id
          })
          dataDeleteListener({
            name: 'development/rebuildServer',
            on: 'update',
            handlerId: id
          })

          // Delete the stream from our broadcast pool
          delete this.sse_streams[response.sse.id]
        })
      }]
    })
  }
})

