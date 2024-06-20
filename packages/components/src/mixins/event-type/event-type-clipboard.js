import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'event-type-clipboard'
  },
  data: {
    eventTypes: {
      'node/copy': true,
      'node/cut': true,
      'node/paste': true
    }
  }
})

