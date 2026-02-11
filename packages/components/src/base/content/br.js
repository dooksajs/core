import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  displayMixin,
  spacingMixin,
  eventTypeMouseMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
} from '@dooksa/components/mixins'

export const br = createComponent({
  id: 'br',
  tag: 'br'
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
 * @typedef {Object} ExtendBrOptions
 * @property {SpacingMixin | DisplayMixin} [options]
 */

/**
 * @typedef {Object} ExtendBrEvent
 * @property {EventTypeMouseMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendBrEventMixin
 * @property {ExtendBrEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendBrOptions
 *   | ExtendBrEventMixin
 * } ExtendBr
 */

/**
 * @param {ExtendBr} options -
 */
export const createBr = function (options) {
  return extendComponent(br, options)
}
