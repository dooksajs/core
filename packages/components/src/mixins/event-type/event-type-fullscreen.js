import { createMixin } from '@dooksa/create-component'

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

