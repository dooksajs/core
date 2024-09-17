import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'node/blur'|
 * 'node/focus'|
 * 'node/focusin'|
 * 'node/focusout'} EventTypeFocusMixin
 */

export default createMixin({
  metadata: {
    id: 'event-type-focus'
  },
  data: {
    eventTypes: {
      'node/blur': true,
      'node/focus': true,
      'node/focusin': true,
      'node/focusout': true
    }
  }
})

