import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  ariaLabelMixin,
  eventTypeElementChangeMixin,
  formControlMixin,
  idMixin,
  inputAllMixin,
  inputTextMixin,
  eventTypeMouseMixin,
  eventTypeFocusMixin,
  eventTypeKeyboardMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
} from '@dooksa/components/mixins'

export const inputEmail = createComponent({
  id: 'input-email',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'email'
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
    list: { name: 'list' },
    size: { name: 'size' },
    multiple: {
      name: 'multiple',
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
  inputTextMixin,
  ariaLabelMixin,
  eventTypeElementChangeMixin,
  eventTypeMouseMixin,
  eventTypeFocusMixin,
  eventTypeKeyboardMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
])

/**
 * @import {IdMixin, InputAllMixin, InputTextMixin, AriaLabelMixin, FormControlMixin, EventTypeElementChangeMixin, EventTypeMouseMixin, EventTypeFocusMixin, EventTypeKeyboardMixin, EventTypeElementDragDropMixin, EventTypeTouchMixin } from '@dooksa/components/mixins'
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendInputEmailOptions
 * @property {string} [list]
 * @property {number} [size]
 * @property {boolean} [multiple]
 * @property {string} [id]
 */

/**
 * @typedef {Object} ExtendInputEmailOptionMixin
 * @property {ExtendInputEmailOptions |
 *   IdMixin |
 *   FormControlMixin |
 *   InputAllMixin |
 *   InputTextMixin |
 *   AriaLabelMixin
 * } [options]
 */

/**
 * @typedef {Object} ExtendInputEmailEvent
 * @property {EventTypeElementChangeMixin | EventTypeMouseMixin | EventTypeFocusMixin | EventTypeKeyboardMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputEmailEventMixin
 * @property {ExtendInputEmailEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendInputEmailOptionMixin
 *   | ExtendInputEmailEventMixin
 * } ExtendInputEmail
 */

/**
 * @param {ExtendInputEmail} options -
 */
export const createInputEmail = function (options) {
  return extendComponent(inputEmail, options)
}
