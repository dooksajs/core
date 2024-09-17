import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'node/click'|
 * 'node/scroll'|
 * 'node/scrollend'|
 * 'node/wheel'} EventTypeScrollMixin
 */

export default createMixin({
  metadata: {
    id: 'event-type-scroll'
  },
  data: {
    eventTypes: {
      'node/scroll': true,
      'node/scrollend': true,
      'node/wheel': true
    }
  }
})

