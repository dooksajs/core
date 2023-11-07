import { createHash } from 'node:crypto'
import { definePlugin, dsPage } from '@dooksa/ds-plugin'

/**
 * DsPage plugin.
 * @namespace dsPage
 */
export default definePlugin({
  name: 'dsPage',
  version: 1,
  dependencies: [
    {
      name: 'dsUser'
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
    dsApp: {
      private: true,
      schema: {
        type: 'string'
      }
    },
    dsCSS: {
      private: true,
      schema: {
        type: 'string'
      }
    },
    dsCSSHash: {
      private: true,
      schema: {
        type: 'string'
      }
    }
  },
  setup ({ dsApp, dsCSS }) {
    if (dsCSS) {
      this.setCSS(dsCSS)
    }

    if (dsApp) {
      this.setApp(dsApp)
    }

    this.$seedDatabase('ds-page-items')

    this.$setWebServerRoute('/*', {
      suffix: '',
      handlers: [this._get.bind(this)]
    })

    this.$setWebServerRoute('/', {
      method: 'post',
      suffix: '',
      middleware: ['dsUser/auth'],
      handlers: [this._save.bind(this)]
    })
  },
  methods: {
    _getById: dsPage.methods._getById,
    _appendExpand: dsPage.methods._appendExpand,
    setApp (item) {
      this.dsApp = item
    },
    setCSS (item = '') {
      this.dsCSS = '<style>' + item + '</style>'
      this.dsCSSHash = this._hash(item)
    },
    _getApp (data = []) {
      return '(() => {const __ds__ =' + JSON.stringify(data) + ';' + this.dsApp + '})()'
    },
    _get (request, response) {
      const pageData = this._getById(request.path)

      response.set('Content-Type', 'text/html')

      if (pageData.isEmpty) {
        response.status(404)
      }

      const dsApp = this._getApp(pageData.item)
      const dsAppHash = this._hash(dsApp)

      let csp = "script-src 'sha256-" + dsAppHash + "'"

      if (this.dsCSSHash) {
        csp += " style-src 'sha256-" + this.dsCSSHash + "'"
      }

      response.set('Content-Security-Policy', csp)

      response.send(
        `${this.templateStart}
          ${this.dsCSS}
          <script>${dsApp}</script>
        ${this.templateEnd}`
      )
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
