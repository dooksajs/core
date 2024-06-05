import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'eventTypeSelect'
  },
  data: {
    eventTypes: {
      selectstart: true
    }
  }
})

