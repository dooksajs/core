import definePlugin from '../definePlugin.js'
import dsEvent from '../ds-plugin-event/index.js'

/**
 * Dooksa server event model management.
 * @namespace dsEvent
 */
export default /* @__PURE__ */ definePlugin({
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
