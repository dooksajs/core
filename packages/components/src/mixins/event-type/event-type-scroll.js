import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'eventTypeScroll'
  },
  data: {
    eventTypes: {
      scroll: true,
      scrollend: true,
      wheel: true
    }
  }
})

