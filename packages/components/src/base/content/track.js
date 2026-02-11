import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
} from '@dooksa/components/mixins'

export const track = createComponent({
  id: 'track',
  tag: 'track',
  options: {
    kind: {
      name: 'kind',
      values: {
        subtitles: 'subtitles',
        captions: 'captions',
        descriptions: 'descriptions',
        chapters: 'chapters',
        metadata: 'metadata'
      }
    },
    src: { name: 'src' },
    srclang: { name: 'srclang' },
    label: { name: 'label' },
    default: {
      name: 'default',
      values: {
        true: true,
        false: false
      }
    }
  }
}, [eventTypeElementDragDropMixin, eventTypeTouchMixin])

/**
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 * @import {EventTypeElementDragDropMixin, EventTypeTouchMixin} from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ExtendTrackOptions
 * @property {'subtitles'|'captions'|'descriptions'|'chapters'|'metadata'} [kind]
 * @property {string} [src]
 * @property {string} [srclang]
 * @property {string} [label]
 * @property {boolean} [default]
 */

/**
 * @typedef {Object} ExtendTrackEvent
 * @property {EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on -
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendTrackEventMixin
 * @property {ExtendTrackEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendTrackOptions
 *   | ExtendTrackEventMixin
 * } ExtendTrack
 */

/**
 * @param {ExtendTrack} options -
 */
export const createTrack = function (options) {
  return extendComponent(track, options)
}
