import dsComponent from '@dooksa/ds-plugin-component'

/**
 * DsPage plugin.
 * @namespace dssComponent
 */
export default {
  name: 'dssComponent',
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
    ...dsComponent.data
  },
  setup () {
    this.$method('dssDatabase/model', {
      name: 'component',
      fields: [
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
            unique: true,
            allowNull: false
          }
        }
      ]
    })
  }
}
