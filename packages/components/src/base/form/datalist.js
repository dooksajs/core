import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  idMixin,
  spacingMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
} from '@dooksa/components/mixins'

export const datalist = createComponent({
  id: 'datalist',
  tag: 'datalist'
}, [idMixin, spacingMixin, eventTypeElementDragDropMixin, eventTypeTouchMixin])

/**
 * @import {
 *   SpacingMixin,
 *   IdMixin,
 *   EventTypeElementDragDropMixin,
 *   EventTypeTouchMixin
 * } from '@dooksa/components/mixins'
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendDatalistOptions
 * @property {IdMixin | SpacingMixin} [options]
 */

/**
 * @typedef {Object} ExtendDatalistEvent
 * @property {EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendDatalistEventMixin
 * @property {ExtendDatalistEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendDatalistOptions
 *   | ExtendDatalistEventMixin
 * } ExtendDatalist
 */

/**
 * @param {ExtendDatalist} options -
 */
export const createDatalist = function (options) {
  return extendComponent(datalist, options)
}
