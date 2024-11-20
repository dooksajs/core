import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'node/keydown'|'node/keyup'} EventTypeKeyboardMixin
 */

export default createMixin({
  metadata: {
    id: 'event-type-keyboard'
  },
  data: {
    eventTypes: {
      'node/keydown': true,
      'node/keyup': true
    }
  }
})

