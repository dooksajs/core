import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'eventTypeElementCancel'
  },
  data: {
    eventTypes: {
      cancel: true
    }
  }
})

