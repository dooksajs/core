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

export const inputTime = createComponent({
  id: 'input-time',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'time'
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
 * @typedef {Object} ExtendInputTimeOptions
 * @property {string} [min]
 * @property {string} [max]
 * @property {number|string} [step]
 * @property {boolean} [readOnly]
 * @property {string} [id]
 */

/**
 * @typedef {Object} ExtendInputTimeOptionMixin
 * @property {ExtendInputTimeOptions |
 *   IdMixin |
 *   FormControlMixin |
 *   InputAllMixin |
 *   AriaLabelMixin
 * } [options]
 */

/**
 * @typedef {Object} ExtendInputTimeEvent
 * @property {EventTypeElementChangeMixin | EventTypeMouseMixin | EventTypeFocusMixin | EventTypeKeyboardMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputTimeEventMixin
 * @property {ExtendInputTimeEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendInputTimeOptionMixin
 *   | ExtendInputTimeEventMixin
 * } ExtendInputTime
 */

/**
 * @param {ExtendInputTime} options -
 */
export const createInputTime = function (options) {
  return extendComponent(inputTime, options)
}
