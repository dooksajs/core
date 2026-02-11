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

export const inputMonth = createComponent({
  id: 'input-month',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'month'
    },
    {
      name: 'className',
      value: 'form-control'
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
    readOnly: {
      name: 'readonly',
      values: {
        true: true,
        false: false
      }
    }
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
 * @typedef {Object} ExtendInputMonthOptions
 * @property {string} [min]
 * @property {string} [max]
 * @property {number|string} [step]
 * @property {boolean} [readOnly]
 * @property {string} [id]
 */

/**
 * @typedef {Object} ExtendInputMonthOptionMixin
 * @property {ExtendInputMonthOptions |
 *   IdMixin |
 *   FormControlMixin |
 *   InputAllMixin |
 *   AriaLabelMixin
 * } [options]
 */

/**
 * @typedef {Object} ExtendInputMonthEvent
 * @property {EventTypeElementChangeMixin | EventTypeMouseMixin | EventTypeFocusMixin | EventTypeKeyboardMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputMonthEventMixin
 * @property {ExtendInputMonthEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendInputMonthOptionMixin
 *   | ExtendInputMonthEventMixin
 * } ExtendInputMonth
 */

/**
 * @param {ExtendInputMonth} options -
 */
export const createInputMonth = function (options) {
  return extendComponent(inputMonth, options)
}
