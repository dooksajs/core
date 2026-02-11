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

export const textarea = createComponent({
  id: 'textarea',
  tag: 'textarea',
  properties: [
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
    cols: { name: 'cols' },
    rows: { name: 'rows' },
    wrap: {
      name: 'wrap',
      values: {
        hard: 'hard',
        soft: 'soft',
        off: 'off'
      }
    },
    maxLength: { name: 'maxlength' },
    minLength: { name: 'minlength' },
    placeholder: { name: 'placeholder' },
    readOnly: {
      name: 'readonly',
      values: {
        true: true,
        false: false
      }
    },
    required: {
      name: 'required',
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
 * @typedef {Object} ExtendTextareaOptions
 * @property {number} [cols]
 * @property {number} [rows]
 * @property {'hard'|'soft'|'off'} [wrap]
 * @property {number} [maxLength]
 * @property {number} [minLength]
 * @property {string} [placeholder]
 * @property {boolean} [readOnly]
 * @property {boolean} [required]
 */

/**
 * @typedef {Object} ExtendTextareaOptionMixin
 * @property {ExtendTextareaOptions |
 *   IdMixin |
 *   FormControlMixin |
 *   InputAllMixin |
 *   AriaLabelMixin
 * } [options]
 */

/**
 * @typedef {Object} ExtendTextareaEvent
 * @property {EventTypeElementChangeMixin | EventTypeMouseMixin | EventTypeFocusMixin | EventTypeKeyboardMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendTextareaEventMixin
 * @property {ExtendTextareaEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendTextareaOptionMixin
 *   | ExtendTextareaEventMixin
 * } ExtendTextarea
 */

/**
 * @param {ExtendTextarea} options -
 */
export const createTextarea = function (options) {
  return extendComponent(textarea, options)
}
