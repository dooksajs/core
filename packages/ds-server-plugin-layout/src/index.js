import dsLayout from '@dooksa/ds-plugin-layout'

/**
 * Dooksa server layout model management
 * @namespace dsLayout
 */
export default {
  name: 'dsLayout',
  version: 1,
  dependencies: [
    {
      name: 'dsUser'
    },
    {
      name: 'dsComponent'
    }
  ],
  data: {
    ...dsLayout.data
  },
  setup () {
    // route: get a list of action
    this.$setWebServerRoute('/layout', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        this.$getDatabaseValue(['dsLayout/items'])
      ]
    })

    // route: delete action sequence
    this.$setWebServerRoute('/layout', {
      method: 'delete',
      middleware: ['dsUser/auth', 'request/queryIsArray'],
      handlers: [
        this.$deleteDatabaseValue(['dsLayout/items'])
      ]
    })
  }
}
