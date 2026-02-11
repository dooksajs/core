import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'node/abort'
 *   | 'node/canplay'
 *   | 'node/canplaythrough'
 *   | 'node/durationchange'
 *   | 'node/emptied'
 *   | 'node/ended'
 *   | 'node/error'
 *   | 'node/loadeddata'
 *   | 'node/loadedmetadata'
 *   | 'node/loadstart'
 *   | 'node/pause'
 *   | 'node/play'
 *   | 'node/playing'
 *   | 'node/progress'
 *   | 'node/ratechange'
 *   | 'node/seeked'
 *   | 'node/seeking'
 *   | 'node/stalled'
 *   | 'node/suspend'
 *   | 'node/timeupdate'
 *   | 'node/volumechange'
 *   | 'node/waiting'
 * } EventTypeMediaMixin
 */

export default createMixin({
  metadata: {
    id: 'event-type-media'
  },
  data: {
    eventTypes: {
      'node/abort': true,
      'node/canplay': true,
      'node/canplaythrough': true,
      'node/durationchange': true,
      'node/emptied': true,
      'node/ended': true,
      'node/error': true,
      'node/loadeddata': true,
      'node/loadedmetadata': true,
      'node/loadstart': true,
      'node/pause': true,
      'node/play': true,
      'node/playing': true,
      'node/progress': true,
      'node/ratechange': true,
      'node/seeked': true,
      'node/seeking': true,
      'node/stalled': true,
      'node/suspend': true,
      'node/timeupdate': true,
      'node/volumechange': true,
      'node/waiting': true
    }
  }
})
