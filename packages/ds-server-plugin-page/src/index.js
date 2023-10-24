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
      default: '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><link rel="icon" type="image/x-icon" href="/favicon.ico"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dooksa</title><link rel="preload" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" as="style"><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous" media="print" onload=\'this.media="all"\'></head><body><div id="root"></div>'
    },
    templateEnd: {
      private: true,
      default: '</body></html>'
    }
  },
  setup () {
    this.$setDatabaseSeed('ds-page-items')

    this.$setWebServerRoute('/*', {
      suffix: '',
      handlers: [(request, response) => {
        const page = this.$getDataValue('dsPage/items', { id: request.path })
        response.set('Content-Type', 'text/html')

        if (page.isEmpty) {
          return response.status(404).send('404')
        }

        const data = '<script>' + page.item + '</script>'

        response.send(Buffer.from(this.templateStart + data + this.templateEnd))
      }]
    })

    this.$setWebServerRoute('/', {
      method: 'post',
      middleware: ['dsUser/auth'],
      handlers: [this.$setDatabaseValue]
    })
  }
}
