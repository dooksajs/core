import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'node/copy'|
 * 'node/cut'|
 * 'node/paste'} EventTypeClipboardMixin
 */

export default createMixin({
  metadata: {
    id: 'event-type-clipboard'
  },
  data: {
    eventTypes: {
      'node/copy': true,
      'node/cut': true,
      'node/paste': true
    }
  }
})

