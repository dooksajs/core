import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'event-type-transition'
  },
  data: {
    eventTypes: {
      'node/transitioncancel': true,
      'node/transitionend': true,
      'node/transitionrun': true,
      'node/transitionstart': true
    }
  }
})

