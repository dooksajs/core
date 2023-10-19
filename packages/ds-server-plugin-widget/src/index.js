import dsWidget from '@dooksa/ds-plugin-widget'

/**
 * Dooksa server widget model management
 * @namespace dsWidget
 */
export default {
  name: 'dsWidget',
  version: 1,
  dependencies: [
    {
      name: 'dsUser'
    },
    {
      name: 'dsComponent'
    },
    {
      name: 'dsEvent'
    },
    {
      name: 'dsLayout'
    },
    {
      name: 'dsContent'
    },
    {
      name: 'dsTemplate'
    },
    {
      name: 'dsSection'
    }
  ],
  data: {
    ...dsWidget.data
  },
  setup () {
    this.$setDatabaseSeed('ds-widget-items')
    this.$setDatabaseSeed('ds-widget-content')
    this.$setDatabaseSeed('ds-widget-events')
    this.$setDatabaseSeed('ds-widget-groups')
    this.$setDatabaseSeed('ds-widget-mode')
    this.$setDatabaseSeed('ds-widget-layouts')
    this.$setDatabaseSeed('ds-widget-sections')
    this.$setDatabaseSeed('ds-widget-templates')

    // route: get a list of action
    this.$setWebServerRoute('/layout', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        this.$getDatabaseValue(['dsWidget/items'])
      ]
    })

    // route: delete action sequence
    this.$setWebServerRoute('/layout', {
      method: 'delete',
      middleware: ['dsUser/auth', 'request/queryIsArray'],
      handlers: [
        this.$deleteDatabaseValue(['dsWidget/items'])
      ]
    })
  }
}
