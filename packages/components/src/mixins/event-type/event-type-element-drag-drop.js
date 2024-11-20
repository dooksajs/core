import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'node/drag'|
 * 'node/dragend'|
 * 'node/dragenter'|
 * 'node/dragleave'|
 * 'node/dragover'|
 * 'node/dragstart'|
 * 'node/drop'} EventTypeElementDragDropMixin
 */

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

