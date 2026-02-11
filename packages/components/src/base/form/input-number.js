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

export const inputNumber = createComponent({
  id: 'input-number',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'number'
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
    placeholder: { name: 'placeholder' },
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
 * @typedef {Object} ExtendInputNumberOptions
 * @property {number} [min]
 * @property {number} [max]
 * @property {number|string} [step]
 * @property {string} [placeholder]
 * @property {boolean} [readOnly]
 * @property {string} [id]
 */

/**
 * @typedef {Object} ExtendInputNumberOptionMixin
 * @property {ExtendInputNumberOptions |
 *   IdMixin |
 *   FormControlMixin |
 *   InputAllMixin |
 *   AriaLabelMixin
 * } [options]
 */

/**
 * @typedef {Object} ExtendInputNumberEvent
 * @property {EventTypeElementChangeMixin | EventTypeMouseMixin | EventTypeFocusMixin | EventTypeKeyboardMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputNumberEventMixin
 * @property {ExtendInputNumberEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendInputNumberOptionMixin
 *   | ExtendInputNumberEventMixin
 * } ExtendInputNumber
 */

/**
 * @param {ExtendInputNumber} options -
 */
export const createInputNumber = function (options) {
  return extendComponent(inputNumber, options)
}
