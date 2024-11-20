import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'node/click'|
 * 'node/auxclick'|
 * 'node/contextmenu'|
 * 'node/dblclick'|
 * 'node/mousedown'|
 * 'node/mouseenter'|
 * 'node/mouseleave'|
 * 'node/mousemove'|
 * 'node/mouseover'|
 * 'node/mouseup'} EventTypeMouseMixin
 */

export default createMixin({
  metadata: {
    id: 'event-type-mouse'
  },
  data: {
    eventTypes: {
      'node/auxclick': true,
      'node/click': true,
      'node/contextmenu': true,
      'node/dblclick': true,
      'node/mousedown': true,
      'node/mouseenter': true,
      'node/mouseleave': true,
      'node/mousemove': true,
      'node/mouseover': true,
      'node/mouseup': true
    }
  }
})

