import createPlugin from '@dooksa/create-plugin'
import { createHash } from 'node:crypto'
import { page, pageGetById, dataGetValue, dataSetValue } from '@dooksa/plugins'
import { databaseSeed, databaseSetValue } from './database.js'
import { httpSetRoute } from './http.js'
import { hash } from '@dooksa/utils'

function hashSHA (item) {
  const hash = createHash('sha256')

  return hash.update(item, 'utf-8').digest('base64')
}

function create ({ request, response }) {
  const appString = dataGetValue({ name: 'page/app' }).item

  response.set('Content-Type', 'text/html')

  const data = request.pageData ? JSON.stringify(request.pageData) : ''
  const app = '(() => {const __ds__ =' + data + ';' + appString + '})()'
  let csp = ''

  PROD: {
    csp = "script-src 'sha256-" + hashSHA(app) + "';style-src 'unsafe-inline';"
  }

  DEV: {
    csp = "script-src 'unsafe-inline'; style-src 'unsafe-inline';"
  }

  const css = dataGetValue({ name: 'page/css' }).item || ''

  response.set('Content-Security-Policy', csp)

  response.status(200).send(
    `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><link rel="icon" type="image/x-icon" href="/favicon.ico"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dooksa</title></head><body>
      <div id="root"></div>
      <script>${app}</script>
      <style>${css}</style>
    </body></html>`
  )
}

const pageServer = createPlugin('page', {
  models: {
    ...page.models,
    app: {
      type: 'string'
    },
    css: {
      type: 'string'
    }
  },
  actions: {
    create
  },
  setup ({ app = '', css = '' } = {}) {
    databaseSeed('page-items')
    dataSetValue({ name: 'page/app', value: app })
    dataSetValue({ name: 'page/css', value: css })

    hash.init()

    httpSetRoute({
      path: '/*',
      suffix: '',
      handlers: [
        (request, response, next) => {
          // create hash
          const id = '_' + hash.update(request.path) + '_'
          const pageData = pageGetById(id)

          if (pageData.isEmpty) {
            return response.sendStatus(404)
          }

          request.pageData = pageData

          next()
        },
        (request, response) => {
          create({ request, response })
        }
      ]
    })

    httpSetRoute({
      path: '/',
      method: 'post',
      suffix: '',
      middleware: ['request/json', 'user/auth'],
      handlers: [(request, response) => {
        const setData = databaseSetValue({
          items: request.body,
          userId: request.userId
        })

        if (!setData.isValid) {
          if (setData.snapshotError) {
            return response.status(500).send(setData.snapshotError)
          }

          return response.status(400).send(setData.error.details)
        }

        response.status(201).send(setData)
      }]
    })
  }
})

const pageCreate = pageServer.actions.create

export {
  pageCreate
}

export default pageServer
