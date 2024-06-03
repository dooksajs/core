import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'eventTypeComposition'
  },
  data: {
    eventTypes: {
      compositionend: true,
      compositionstart: true,
      compositionupdate: true
    }
  }
})

