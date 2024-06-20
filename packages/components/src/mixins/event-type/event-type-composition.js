import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'event-type-composition'
  },
  data: {
    eventTypes: {
      'node/compositionend': true,
      'node/compositionstart': true,
      'node/compositionupdate': true
    }
  }
})

