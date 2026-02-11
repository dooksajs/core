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

export const inputWeek = createComponent({
  id: 'input-week',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'week'
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
 * @typedef {Object} ExtendInputWeekOptions
 * @property {string} [min]
 * @property {string} [max]
 * @property {number|string} [step]
 * @property {boolean} [readOnly]
 * @property {string} [id]
 */

/**
 * @typedef {Object} ExtendInputWeekOptionMixin
 * @property {ExtendInputWeekOptions |
 *   IdMixin |
 *   FormControlMixin |
 *   InputAllMixin |
 *   AriaLabelMixin
 * } [options]
 */

/**
 * @typedef {Object} ExtendInputWeekEvent
 * @property {EventTypeElementChangeMixin | EventTypeMouseMixin | EventTypeFocusMixin | EventTypeKeyboardMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputWeekEventMixin
 * @property {ExtendInputWeekEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendInputWeekOptionMixin
 *   | ExtendInputWeekEventMixin
 * } ExtendInputWeek
 */

/**
 * @param {ExtendInputWeek} options -
 */
export const createInputWeek = function (options) {
  return extendComponent(inputWeek, options)
}
