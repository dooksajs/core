import dsEvent from '@dooksa/ds-plugin-event'

/**
 * Dooksa server event model management.
 * @namespace dssEvent
 */
export default {
  name: 'dssEvent',
  version: 1,
  dependencies: [
    {
      name: 'dssDatabase'
    },
    {
      name: 'dssWebServer'
    },
    {
      name: 'dssUser'
    }
  ],
  data: {
    ...dsEvent.data
  },
  setup () {
    this.$setDatabaseModel('event', [
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
