import createPlugin from '@dooksa/create-plugin'
import { httpSetRoute } from './http.js'
import { dataAddListener, dataDeleteListener } from '../client/index.js'
import { generateId } from '@dooksa/utils'

export const development = createPlugin('development', {
  models: {
    rebuild: {
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
          name: 'development/rebuild',
          on: 'update',
          handlerId: id,
          handler: (data) => {
            response.sse.send(id, 'rebuild', JSON.stringify(data))
          }
        })

        // close the connection when the client disconnects
        response.once('close', () => {
          // delete client/server rebuild data listeners
          dataDeleteListener({
            name: 'development/rebuild',
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

