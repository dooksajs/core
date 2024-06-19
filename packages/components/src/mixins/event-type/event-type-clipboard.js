import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'eventTypeClipboard'
  },
  data: {
    eventTypes: {
      copy: true,
      cut: true,
      paste: true
    }
  }
})

