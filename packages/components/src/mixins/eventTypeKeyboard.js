import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'eventTypeKeyboard'
  },
  data: {
    eventTypes: {
      keydown: true,
      keyup: true
    }
  }
})

