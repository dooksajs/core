import dsTemplate from '@dooksa/ds-plugin-template'

/**
 * DsPage plugin.
 * @namespace dsTemplate
 */
export default {
  name: 'dsTemplate',
  version: 1,
  dependencies: [
    {
      name: 'dsUser'
    }
  ],
  data: {
    ...dsTemplate.data
  },
  setup () {
    this.$setDatabaseModel('template', [
      {
        name: 'id',
        type: 'string',
        options: {
          primaryKey: true
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
