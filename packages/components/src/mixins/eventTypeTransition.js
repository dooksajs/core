import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'eventTypeTransition'
  },
  data: {
    eventTypes: {
      transitioncancel: true,
      transitionend: true,
      transitionrun: true,
      transitionstart: true
    }
  }
})

