import { createHash } from 'node:crypto'
import { dsPage } from '@dooksa/ds-plugin'
import { definePlugin } from '@dooksa/ds-scripts'

/**
 * DsPage plugin.
 * @namespace dsPage
 */
export default definePlugin({
  name: 'dsPage',
  version: 1,
  dependencies: [
    {
      name: 'dsUser',
      version: 1
    },
    {
      name: 'dsAction',
      version: 1
    }
  ],
  data: {
    ...dsPage.data,
    templateStart: {
      private: true,
      default: () => '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><link rel="icon" type="image/x-icon" href="/favicon.ico"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dooksa</title></head><body><div id="root"></div>'
    },
    templateEnd: {
      private: true,
      default: () => '</body></html>'
    },
    app: {
      private: true,
      schema: {
        type: 'string'
      }
    },
    css: {
      default: () => '',
      schema: {
        type: 'string'
      }
    },
    cssHash: {
      private: true,
      schema: {
        type: 'string'
      }
    }
  },
  setup ({ dsApp }) {
    if (dsApp) {
      this.setApp(dsApp)
    }

    this.$seedDatabase('ds-page-items')

    this.$setWebServerRoute('/*', {
      suffix: '',
      handlers: [
        this._get.bind(this),
        (request, response) => {
          this.create({ request, response })
        }
      ]
    })

    this.$setWebServerRoute('/', {
      method: 'post',
      suffix: '',
      middleware: ['request/json', 'dsUser/auth'],
      handlers: [this._save.bind(this)]
    })
  },
  methods: {
    getById: dsPage.methods._getById,
    create ({ request, response }) {
      response.set('Content-Type', 'text/html')

      const app = this._getApp(request.dsPageData)
      const appHash = this._hash(app)
      const css = this.$getDataValue('dsPage/css').item || ''
      let csp = "script-src 'sha256-" + appHash + "';"

      if (css) {
        const cssHash = this._hash(css)

        csp += "style-src 'sha256-" + cssHash + "'"
      }

      response.set('Content-Security-Policy', csp)

      response.status(200).send(
        `${this.templateStart}
          <script>${app}</script>
          <style>${css}</style>
        ${this.templateEnd}`
      )
    },
    setApp (item) {
      this.dsApp = item
    },
    _appendExpand: dsPage.methods._appendExpand,
    _getApp (data = []) {
      return '(() => {const __ds__ =' + JSON.stringify(data) + ';' + this.dsApp + '})()'
    },
    _get (request, response, next) {
      const pageData = this.getById(request.path)

      if (pageData.isEmpty) {
        return response.sendStatus(404)
      }

      request.dsPageData = pageData

      next()
    },
    _hash (item) {
      const hash = createHash('sha256')

      return hash.update(item, 'utf-8').digest('base64')
    },
    _save (request, response) {
      const setData = this.$setDatabaseValue({
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
    }
  }
})
