import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'node/touchcancel'|
 * 'node/touchend'|
 * 'node/touchmove'|
 * 'node/touchstart'} EventTypeTouchMixin
 */

export default createMixin({
  metadata: {
    id: 'event-type-touch'
  },
  data: {
    eventTypes: {
      'node/touchcancel': true,
      'node/touchend': true,
      'node/touchmove': true,
      'node/touchstart': true
    }
  }
})

