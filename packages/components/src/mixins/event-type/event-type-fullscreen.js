import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'node/fullscreenchange'|'node/fullscreenerror'} EventTypeFullscreenMixin
 */

export default createMixin({
  metadata: {
    id: 'event-type-fullscreen'
  },
  data: {
    eventTypes: {
      'node/fullscreenchange': true,
      'node/fullscreenerror': true
    }
  }
})

