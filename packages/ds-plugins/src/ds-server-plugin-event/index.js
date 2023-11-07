import definePlugin from '../definePlugin'
import dsEvent from '../ds-plugin-event'

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
