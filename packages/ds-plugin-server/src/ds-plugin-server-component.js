import { dsComponent } from '@dooksa/ds-plugin'
import { definePlugin } from '@dooksa/utils'

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
  components: dsComponent.components,
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
