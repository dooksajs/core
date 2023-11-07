import definePlugin from '../definePlugin'
import dsLayout from '../ds-plugin-layout'

/**
 * Dooksa server layout model management
 * @namespace dsLayout
 */
export default definePlugin({
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
    this.$seedDatabase('ds-layout-items')

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
})
