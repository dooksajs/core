import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'event-type-element-drag-drop'
  },
  data: {
    eventTypes: {
      'node/drag': true,
      'node/dragend': true,
      'node/dragenter': true,
      'node/dragleave': true,
      'node/dragover': true,
      'node/dragstart': true,
      'node/drop': true
    }
  }
})

