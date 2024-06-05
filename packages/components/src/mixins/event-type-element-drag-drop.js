import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'eventTypeElementCancel'
  },
  data: {
    eventTypes: {
      drag: true,
      dragend: true,
      dragenter: true,
      dragleave: true,
      dragover: true,
      dragstart: true,
      drop: true
    }
  }
})

