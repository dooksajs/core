import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'event-type-element-cancel'
  },
  data: {
    eventTypes: {
      'node/cancel': true
    }
  }
})

