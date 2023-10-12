import dsEvent from '@dooksa/ds-plugin-event'

/**
 * Dooksa server event model management.
 * @namespace dsEvent
 */
export default {
  name: 'dsEvent',
  version: 1,
  dependencies: [
    {
      name: 'dsUser'
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
