import dsAction from '@dooksa/ds-plugin-action'

/**
 * DsPage plugin.
 * @namespace dsAction
 */
export default {
  name: 'dsAction',
  version: 1,
  dependencies: [
    {
      name: 'dsUser'
    }
  ],
  data: {
    ...dsAction.data
  },
  setup () {
    // route: get a list of action sequence entries
    this.$setWebServerRoute('/action', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [this.$getDatabaseValue(['dsAction/items'])]
    })

    // route: delete action sequence entries
    this.$setWebServerRoute('/action', {
      method: 'delete',
      middleware: ['dsUser/auth', 'request/queryIsArray'],
      handlers: [
        this.$deleteDatabaseValue(['dsAction/items'])
      ]
    })

    // route: get a list of action
    this.$setWebServerRoute('/action/sequence', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        this.$getDatabaseValue(['dsAction/sequences'])
      ]
    })

    // route: delete action sequence
    this.$setWebServerRoute('/action/sequence', {
      method: 'delete',
      middleware: ['dsUser/auth', 'request/queryIsArray'],
      handlers: [
        this.$deleteDatabaseValue(['dsAction/sequences'])
      ]
    })

    // route: get a list of action
    this.$setWebServerRoute('/action/block', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        this.$getDatabaseValue(['dsAction/blocks'])
      ]
    })

    // route: delete action
    this.$setWebServerRoute('/action/block', {
      method: 'delete',
      middleware: ['dsUser/auth', 'request/queryIsArray'],
      handlers: [
        this.$deleteDatabaseValue(['dsAction/blocks'])
      ]
    })
  }
}
