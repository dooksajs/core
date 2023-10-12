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
