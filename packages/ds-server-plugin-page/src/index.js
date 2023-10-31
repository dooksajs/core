import dsPage from '@dooksa/ds-plugin-page'

/**
 * DsPage plugin.
 * @namespace dsPage
 */
export default {
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
      default: '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><link rel="icon" type="image/x-icon" href="/favicon.ico"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dooksa</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous" media="print" onload=\'this.media="all"\'></head><body><div id="root"></div>'
    },
    templateEnd: {
      private: true,
      default: '</body></html>'
    }
  },
  setup () {
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
    _appendExpand: dsPage.methods._appendExpand.bind(this),
    _getById: dsPage.methods._getById.bind(this),
    _get (request, response) {
      const pageData = this._getById(request.path)
      response.set('Content-Type', 'text/html')

      if (pageData.isEmpty) {
        return response.status(404).send('404')
      }

      const data = '<script>window.dsData = ' + pageData.item + '</script>'

      response.send(Buffer.from(this.templateStart + data + this.templateEnd))
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
}
