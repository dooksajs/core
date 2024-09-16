import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'event-type-scroll'
  },
  data: {
    eventTypes: {
      'node/scroll': true,
      'node/scrollend': true,
      'node/wheel': true
    }
  }
})

