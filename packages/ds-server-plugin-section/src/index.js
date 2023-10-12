import dsSection from '@dooksa/ds-plugin-section'

/**
 * DsPage plugin.
 * @namespace dssSection
 */
export default {
  name: 'dssSection',
  version: 1,
  dependencies: [
    {
      name: 'dssDatabase'
    },
    {
      name: 'dssWebServer'
    }
  ],
  data: {
    ...dsSection.data
  },
  setup () {
    this.$setDatabaseModel('section', [
        {
          name: 'id',
          type: 'string',
          options: {
            primaryKey: true
          }
        },
        {
          name: 'groupId',
          type: 'string',
          options: {
            allowNull: false
          }
        },
        {
          name: 'mode',
          type: 'string',
          options: {
            allowNull: false
          }
        },
        {
          name: 'data',
          type: 'json',
          options: {
            allowNull: false
          }
        }
    ])
  }
}
