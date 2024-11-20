import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'node/transitioncancel'|
 * 'node/transitionend'|
 * 'node/transitionrun'|
 * 'node/transitionstart'} EventTypeTransitionMixin
 */

export default createMixin({
  metadata: {
    id: 'event-type-transition'
  },
  data: {
    eventTypes: {
      'node/transitioncancel': true,
      'node/transitionend': true,
      'node/transitionrun': true,
      'node/transitionstart': true
    }
  }
})

