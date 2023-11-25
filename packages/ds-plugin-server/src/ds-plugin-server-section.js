import { dsSection } from '@dooksa/ds-plugin'
import { definePlugin } from '@dooksa/utils'

/**
 * DsPage plugin.
 * @namespace dsSection
 */
export default definePlugin({
  name: 'dsSection',
  version: 1,
  dependencies: [{
    name: 'dsUser'
  }],
  data: {
    ...dsSection.data
  },
  setup () {
    this.$seedDatabase('ds-section-items')

    // route: get a list of section
    this.$setWebServerRoute('/section', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        this.$getDatabaseValue(['dsSection/items'])
      ]
    })

    // route: delete section
    this.$setWebServerRoute('/section', {
      method: 'delete',
      middleware: ['dsUser/auth', 'request/queryIsArray'],
      handlers: [
        this.$deleteDatabaseValue(['dsSection/items'])
      ]
    })
  }
})
