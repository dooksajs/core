import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'eventTypeElement'
  },
  data: {
    eventTypes: {
      load: true,
      error: true
    }
  }
})

