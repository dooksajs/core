import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
} from '@dooksa/components/mixins'

export const param = createComponent({
  id: 'param',
  tag: 'param',
  options: {
    name: { name: 'name' },
    value: { name: 'value' }
  }
}, [eventTypeElementDragDropMixin, eventTypeTouchMixin])

/**
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 * @import {EventTypeElementDragDropMixin, EventTypeTouchMixin} from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ExtendParamOptions
 * @property {string} [name]
 * @property {string} [value]
 */

/**
 * @typedef {Object} ExtendParamEvent
 * @property {EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendParamEventMixin
 * @property {ExtendParamEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendParamOptions
 *   | ExtendParamEventMixin
 * } ExtendParam
 */

/**
 * @param {ExtendParam} options -
 */
export const createParam = function (options) {
  return extendComponent(param, options)
}
