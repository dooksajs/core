import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  ariaLabelMixin,
  eventTypeElementChangeMixin,
  formControlMixin,
  idMixin,
  inputAllMixin,
  eventTypeMouseMixin,
  eventTypeFocusMixin,
  eventTypeKeyboardMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
} from '@dooksa/components/mixins'

export const inputRange = createComponent({
  id: 'input-range',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'range'
    },
    {
      name: 'className',
      value: 'form-range'
    }
  ],
  content: [
    {
      name: 'value',
      nodePropertyName: 'value'
    }
  ],
  options: {
    min: { name: 'min' },
    max: { name: 'max' },
    step: { name: 'step' },
    list: { name: 'list' }
  }
}, [
  idMixin,
  formControlMixin,
  inputAllMixin,
  ariaLabelMixin,
  eventTypeElementChangeMixin,
  eventTypeMouseMixin,
  eventTypeFocusMixin,
  eventTypeKeyboardMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
])

/**
 * @import {IdMixin, InputAllMixin, AriaLabelMixin, FormControlMixin, EventTypeElementChangeMixin, EventTypeMouseMixin, EventTypeFocusMixin, EventTypeKeyboardMixin, EventTypeElementDragDropMixin, EventTypeTouchMixin } from '@dooksa/components/mixins'
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendInputRangeOptions
 * @property {number} [min]
 * @property {number} [max]
 * @property {number|string} [step]
 * @property {string} [list]
 * @property {string} [id]
 */

/**
 * @typedef {Object} ExtendInputRangeOptionMixin
 * @property {ExtendInputRangeOptions |
 *   IdMixin |
 *   FormControlMixin |
 *   InputAllMixin |
 *   AriaLabelMixin
 * } [options]
 */

/**
 * @typedef {Object} ExtendInputRangeEvent
 * @property {EventTypeElementChangeMixin | EventTypeMouseMixin | EventTypeFocusMixin | EventTypeKeyboardMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputRangeEventMixin
 * @property {ExtendInputRangeEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendInputRangeOptionMixin
 *   | ExtendInputRangeEventMixin
 * } ExtendInputRange
 */

/**
 * @param {ExtendInputRange} options -
 */
export const createInputRange = function (options) {
  return extendComponent(inputRange, options)
}
