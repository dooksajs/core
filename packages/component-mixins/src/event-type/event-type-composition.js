import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'node/compositionend'|
 * 'node/compositionstart'|
 * 'node/compositionupdate'} EventTypeCompositionMixin
 */

export default createMixin({
  metadata: {
    id: 'event-type-composition'
  },
  data: {
    eventTypes: {
      'node/compositionend': true,
      'node/compositionstart': true,
      'node/compositionupdate': true
    }
  }
})

