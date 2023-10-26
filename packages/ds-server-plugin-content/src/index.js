import dsContent from '@dooksa/ds-plugin-content'

/**
 * DsPage plugin.
 * @namespace dsContent
 */
export default {
  name: 'dsContent',
  version: 1,
  dependencies: [
    {
      name: 'dsUser'
    }
  ],
  data: {
    ...dsContent.data
  },
  setup () {
    this.$setDatabaseSeed('ds-content-items')
    this.$setDatabaseSeed('ds-content-type')

    // route: delete content
    this.$setWebServerRoute('/content', {
      method: 'delete',
      middleware: ['dsUser/auth', 'request/queryIsArray'],
      handlers: [
        this.$deleteDatabaseValue(['dsContent/items'])
      ]
    })

    // route: get a list of content
    this.$setWebServerRoute('/content', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        this.$getDatabaseValue(['dsContent/items'])
      ]
    })
  }
}
