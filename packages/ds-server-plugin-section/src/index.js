import dsSection from '@dooksa/ds-plugin-section'

/**
 * DsPage plugin.
 * @namespace dsSection
 */
export default {
  name: 'dsSection',
  version: 1,
  data: {
    ...dsSection.data
  },
  setup () {
    this.$setDatabaseSeed('ds-section-items')

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
}
