import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  idMixin,
  spacingMixin,
  dimensionMixin,
  eventTypeMouseMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
} from '@dooksa/components/mixins'

export const meter = createComponent({
  id: 'meter',
  tag: 'meter',
  options: {
    value: { name: 'value' },
    min: { name: 'min' },
    max: { name: 'max' },
    low: { name: 'low' },
    high: { name: 'high' },
    optimum: { name: 'optimum' }
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
 * @typedef {Object} ExtendMeterOptions
 * @property {number} [value]
 * @property {number} [min]
 * @property {number} [max]
 * @property {number} [low]
 * @property {number} [high]
 * @property {number} [optimum]
 * @property {IdMixin | SpacingMixin | DimensionMixin} [options]
 */

/**
 * @typedef {Object} ExtendMeterEvent
 * @property {EventTypeMouseMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendMeterEventMixin
 * @property {ExtendMeterEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendMeterOptions
 *   | ExtendMeterEventMixin
 * } ExtendMeter
 */

/**
 * @param {ExtendMeter} options -
 */
export const createMeter = function (options) {
  return extendComponent(meter, options)
}
