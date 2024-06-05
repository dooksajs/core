import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'eventTypeTouch'
  },
  data: {
    eventTypes: {
      touchcancel: true,
      touchend: true,
      touchmove: true,
      touchstart: true
    }
  }
})

