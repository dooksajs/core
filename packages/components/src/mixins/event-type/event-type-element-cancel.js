import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'node/cancel'} EventTypeElementCancelMixin
 */

export default createMixin({
  metadata: {
    id: 'event-type-element-cancel'
  },
  data: {
    eventTypes: {
      'node/cancel': true
    }
  }
})

