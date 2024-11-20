import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'node/load'|'node/error'} EventTypeElementMixin
 */

export default createMixin({
  metadata: {
    id: 'event-type-element'
  },
  data: {
    eventTypes: {
      'node/load': true,
      'node/error': true
    }
  }
})

