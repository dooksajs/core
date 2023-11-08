import { definePlugin } from '@dooksa/ds-app'

/**
 * @namespace dsServerDevelopment
 */
export default definePlugin({
  name: 'dsDevelopment',
  version: 1,
  data: {
    rebuildClient: {
      schema: {
        type: 'number'
      }
    }
  },
  setup () {
    this.$setWebServerRoute('/build/template/:id', {
      method: 'get',
      handlers: [
        this._template.bind(this)
      ]
    })

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
      this.$addDataListener('dsDevelopment/rebuildClient', {
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
        this.$deleteDataListener('dsDevelopment/rebuildClient', {
          on: 'update',
          handlerId: id
        })
      })
    },
    _template (request, response) {
      // build templates
      // if (dsConfig.templates) {
      //   const template = buildTemplates(dsConfig.templates, app.components)

      //   app.$setDataValue('dsAction/blocks', template.actions.blocks, {
      //     merge: true
      //   })

      //   app.$setDataValue('dsAction/sequences', template.actions.sequences, {
      //     merge: true
      //   })

      //   app.$setDataValue('dsAction/items', template.actions.items, {
      //     merge: true
      //   })

      //   for (let i = 0; i < template.elements.length; i++) {
      //     const element = template.elements[i]

      //     app.$action('dsTemplate/parseHTML', {
      //       html: element,
      //       actions: template.actionSequences
      //     },
      //     {
      //       onSuccess: (result) => {
      //         const id = app.$method('dsTemplate/create', {
      //           id: result.id,
      //           mode: result.mode,
      //           language: result.lang
      //         })

      //         app.$action('dsSection/create', { id })
      //       }
      //     })
      //   }
      // }
    }
  }
})
