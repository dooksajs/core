import definePlugin from '../definePlugin.js'
import dsComponent from '../ds-plugin-component/index.js'

/**
 * DsPage plugin.
 * @namespace dsComponent
 */
export default definePlugin({
  name: 'dsComponent',
  version: 1,
  dependencies: [
    {
      name: 'dsUser'
    }
  ],
  data: {
    ...dsComponent.data
  },
  setup () {
    this.$seedDatabase('ds-component-items')

    // route: get a list of component
    this.$setWebServerRoute('/component', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        this.$getDatabaseValue(['dsComponent/items'])
      ]
    })

    // route: delete component
    this.$setWebServerRoute('/component', {
      method: 'delete',
      middleware: ['dsUser/auth', 'request/queryIsArray'],
      handlers: [
        this.$deleteDatabaseValue(['dsComponent/items'])
      ]
    })
  }
})
