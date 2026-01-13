import { createPlugin, mapState } from '@dooksa/create-plugin'
import { createHash } from 'node:crypto'
import { page as pageClient, pageGetItemsByPath, stateGetValue, stateSetValue } from '../client/index.js'
import { databaseSeed, databaseSetValue } from './database.js'
import { httpSetRoute } from './http.js'

/**
 * @import {DataValue} from '../../../types.js'
 */

function hashSHA (item) {
  const hash = createHash('sha256')

  return hash.update(item, 'utf-8').digest('base64')
}

export const page = createPlugin('page', {
  state: {
    schema: {
      app: {
        type: 'string'
      },
      sourcemap: {
        type: 'collection',
        items: {
          type: 'string'
        }
      },
      css: {
        type: 'string'
      },
      ...mapState(pageClient).schema
    }
  },
  methods: {
    /**
     * Creates Dooksa app
     * @param {DataValue[]} data
     * @returns {{ script: string, csp: string }}
     */
    createApp (data = []) {
      const appString = stateGetValue({ name: 'page/app' }).item
      let script = '(() => {const __ds =' + JSON.stringify(data) + ';' + appString

      DEV: {
        const sourcemap = stateGetValue({
          name: 'page/sourcemap',
          id: 'app-client.js.map'
        })

        if (!sourcemap.isEmpty) {
          script += '//# sourceMappingURL=/_/sourcemap/app-client.js.map\n'
        }
      }

      script += '})()'

      return {
        script,
        csp: "script-src 'sha256-" + hashSHA(script) + "';"
      }
    },
    /**
     * Create Dooksa CSS
     * @returns {{ css: string, csp: string }}
     */
    createCSS () {
      const css = stateGetValue({ name: 'page/css' })

      if (css.isEmpty) {
        throw new Error('DooksaError: No CSS found')
      }

      return {
        css: css.item,
        csp: "style-src 'sha256-" + hashSHA(css.item) + "';"
      }
    },
    /**
     * Creates Dooksa app
     * @param {DataValue[]} data
     * @returns {{ html: string, csp: string }}
     */
    create (data){
      const style = this.createCSS()
      const app = this.createApp(data)

      return {
        html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><link rel="icon" type="image/x-icon" href="/assets/favicon.ico"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dooksa</title></head><body><div id="root"></div><script>${app.script}</script><style>${style.css}</style></body></html>`,
        csp: app.csp + style.csp
      }
    }
  },
  async setup ({ app = '', css = '' } = {}) {
    await databaseSeed('page-paths')
    await databaseSeed('page-redirects')
    await databaseSeed('page-items')

    stateSetValue({
      name: 'page/app',
      value: app
    })
    stateSetValue({
      name: 'page/css',
      value: css
    })

    httpSetRoute({
      path: '/{*splat}',
      suffix: '',
      handlers: [
        (request, response) => {
          const page = pageGetItemsByPath(request.path)
          const app = pageCreate(page.item)

          response.setHeader('Content-Security-Policy', app.csp)

          if (!page.isEmpty) {
            if (page.redirect) {
              const status = !page.isTemporary ? 301 : 302

              response.status(status)
              response.setHeader('Location', page.redirect)
            } else {
              response.status(200)
            }
          } else {
            response.status(404)
          }

          response.send(app.html)
        }
      ]
    })

    httpSetRoute({
      path: '/sourcemap/:filename',
      handlers: [(request, response) => {
        const sourcemap = stateGetValue({
          name: 'page/sourcemap',
          id: request.params.filename
        })

        if (sourcemap.isEmpty) {
          return response.status(404).send()
        }

        response.send(sourcemap.item)
      }]
    })

    httpSetRoute({
      path: '/',
      method: 'post',
      suffix: '',
      middleware: ['user/auth'],
      handlers: [(request, response) => {
        const setData = databaseSetValue({
          items: request.body,
          userId: request.userId
        })

        if (!setData.isValid) {
          if (setData.snapshotError) {
            return response.status(500).json(setData.snapshotError)
          }

          return response.status(400).json(setData.error.details)
        }

        response.status(201).json(setData)
      }]
    })
  }
})

export const {
  pageCreate
} = page

export default page
