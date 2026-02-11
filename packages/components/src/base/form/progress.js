import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  idMixin,
  spacingMixin,
  dimensionMixin,
  eventTypeMouseMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
} from '@dooksa/components/mixins'

export const progress = createComponent({
  id: 'progress',
  tag: 'progress',
  options: {
    max: { name: 'max' },
    value: { name: 'value' }
  }
}, [
  idMixin,
  spacingMixin,
  dimensionMixin,
  eventTypeMouseMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
])

/**
 * @import {
 *   SpacingMixin,
 *   IdMixin,
 *   DimensionMixin,
 *   EventTypeMouseMixin,
 *   EventTypeElementDragDropMixin,
 *   EventTypeTouchMixin
 * } from '@dooksa/components/mixins'
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendProgressOptions
 * @property {number} [max]
 * @property {number} [value]
 * @property {IdMixin | SpacingMixin | DimensionMixin} [options]
 */

/**
 * @typedef {Object} ExtendProgressEvent
 * @property {EventTypeMouseMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendProgressEventMixin
 * @property {ExtendProgressEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendProgressOptions
 *   | ExtendProgressEventMixin
 * } ExtendProgress
 */

/**
 * @param {ExtendProgress} options -
 */
export const createProgress = function (options) {
  return extendComponent(progress, options)
}
