import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'event-type-keyboard'
  },
  data: {
    eventTypes: {
      'node/keydown': true,
      'node/keyup': true
    }
  }
})

