import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'node/close'|'node/cancel'} EventTypeDialogMixin
 */

export default createMixin({
  metadata: {
    id: 'event-type-dialog'
  },
  data: {
    eventTypes: {
      'node/close': true,
      'node/cancel': true
    }
  }
})
