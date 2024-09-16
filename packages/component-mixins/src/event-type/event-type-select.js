import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'event-type-select'
  },
  data: {
    eventTypes: {
      'node/selectstart': true
    }
  }
})

