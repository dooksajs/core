import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  displayMixin,
  spacingMixin,
  eventTypeMouseMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
} from '@dooksa/components/mixins'

export const wbr = createComponent({
  id: 'wbr',
  tag: 'wbr'
}, [
  displayMixin,
  spacingMixin,
  eventTypeMouseMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
])

/**
 * @import {
 *   SpacingMixin,
 *   DisplayMixin,
 *   EventTypeMouseMixin,
 *   EventTypeElementDragDropMixin,
 *   EventTypeTouchMixin
 * } from '@dooksa/components/mixins'
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendWbrOptions
 * @property {SpacingMixin | DisplayMixin} [options]
 */

/**
 * @typedef {Object} ExtendWbrEvent
 * @property {EventTypeMouseMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendWbrEventMixin
 * @property {ExtendWbrEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendWbrOptions
 *   | ExtendWbrEventMixin
 * } ExtendWbr
 */

/**
 * @param {ExtendWbr} options -
 */
export const createWbr = function (options) {
  return extendComponent(wbr, options)
}
