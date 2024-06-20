import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'event-type-element-change'
  },
  data: {
    eventTypes: {
      'node/change': true
    }
  }
})

