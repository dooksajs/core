import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'eventTypeAnimation'
  },
  data: {
    eventTypes: {
      animationcancel: true,
      animationend: true,
      animationiteration: true,
      animationstart: true
    }
  }
})

