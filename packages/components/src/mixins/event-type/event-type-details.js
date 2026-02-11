import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'node/toggle'} EventTypeDetailsMixin
 */

export default createMixin({
  metadata: {
    id: 'event-type-details'
  },
  data: {
    eventTypes: {
      'node/toggle': true
    }
  }
})
