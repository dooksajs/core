import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'eventTypeFullscreen'
  },
  data: {
    eventTypes: {
      fullscreenchange: true,
      fullscreenerror: true
    }
  }
})

