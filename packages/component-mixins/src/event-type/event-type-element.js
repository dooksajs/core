import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'event-type-element'
  },
  data: {
    eventTypes: {
      'node/load': true,
      'node/error': true
    }
  }
})

