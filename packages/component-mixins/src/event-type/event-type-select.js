import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'node/selectstart'} EventTypeSelectMixin
 */

export default createMixin({
  metadata: {
    id: 'event-type-select'
  },
  data: {
    eventTypes: {
      'node/selectstart': true
    }
  }
})

