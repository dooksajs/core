import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
} from '@dooksa/components/mixins'

export const optgroup = createComponent({
  id: 'optgroup',
  tag: 'optgroup',
  options: {
    label: { name: 'label' },
    disabled: { name: 'disabled' }
  }
}, [eventTypeElementDragDropMixin, eventTypeTouchMixin])

/**
 * @import {
 *   EventTypeElementDragDropMixin,
 *   EventTypeTouchMixin
 * } from '@dooksa/components/mixins'
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendOptgroupOptions
 * @property {string} [label]
 * @property {boolean} [disabled]
 */

/**
 * @typedef {Object} ExtendOptgroupEvent
 * @property {EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendOptgroupEventMixin
 * @property {ExtendOptgroupEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendOptgroupOptions
 *   | ExtendOptgroupEventMixin
 * } ExtendOptgroup
 */

/**
 * @param {ExtendOptgroup} options -
 */
export const createOptgroup = function (options) {
  return extendComponent(optgroup, options)
}
