import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'node/animationcancel'|
 * 'node/animationend'|
 * 'node/animationiteration'|
 * 'node/animationstart'} EventTypeAnimationMixin
 */

export default createMixin({
  metadata: {
    id: 'event-type-animation'
  },
  data: {
    eventTypes: {
      'node/animationcancel': true,
      'node/animationend': true,
      'node/animationiteration': true,
      'node/animationstart': true
    }
  }
})

