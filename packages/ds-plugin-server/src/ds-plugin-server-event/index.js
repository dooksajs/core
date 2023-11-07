import { definePlugin, dsEvent } from '@dooksa/ds-plugin'

/**
 * Dooksa server event model management.
 * @namespace dsEvent
 */
export default definePlugin({
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

  }
})
