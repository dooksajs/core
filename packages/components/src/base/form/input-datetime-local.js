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

export const inputDatetimeLocal = createComponent({
  id: 'input-datetime-local',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'datetime-local'
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
 * @typedef {Object} ExtendInputDatetimeLocalOptions
 * @property {string} [min]
 * @property {string} [max]
 * @property {number|string} [step]
 * @property {boolean} [readOnly]
 * @property {string} [id]
 */

/**
 * @typedef {Object} ExtendInputDatetimeLocalOptionMixin
 * @property {ExtendInputDatetimeLocalOptions |
 *   IdMixin |
 *   FormControlMixin |
 *   InputAllMixin |
 *   AriaLabelMixin
 * } [options]
 */

/**
 * @typedef {Object} ExtendInputDatetimeLocalEvent
 * @property {EventTypeElementChangeMixin | EventTypeMouseMixin | EventTypeFocusMixin | EventTypeKeyboardMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputDatetimeLocalEventMixin
 * @property {ExtendInputDatetimeLocalEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendInputDatetimeLocalOptionMixin
 *   | ExtendInputDatetimeLocalEventMixin
 * } ExtendInputDatetimeLocal
 */

/**
 * @param {ExtendInputDatetimeLocal} options -
 */
export const createInputDatetimeLocal = function (options) {
  return extendComponent(inputDatetimeLocal, options)
}
