import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'node/change'|'node/input'} EventTypeElementChangeMixin
 */

export default createMixin({
  metadata: {
    id: 'event-type-element-change'
  },
  data: {
    eventTypes: {
      'node/change': true,
      'node/input': true
    }
  }
})
