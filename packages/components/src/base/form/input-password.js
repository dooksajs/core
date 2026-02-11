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

export const inputPassword = createComponent({
  id: 'input-password',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'password'
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
    size: { name: 'size' }
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
 * @typedef {Object} ExtendInputPasswordOptions
 * @property {number} [size]
 * @property {string} [id]
 */

/**
 * @typedef {Object} ExtendInputPasswordOptionMixin
 * @property {ExtendInputPasswordOptions |
 *   IdMixin |
 *   FormControlMixin |
 *   InputAllMixin |
 *   InputTextMixin |
 *   AriaLabelMixin
 * } [options]
 */

/**
 * @typedef {Object} ExtendInputPasswordEvent
 * @property {EventTypeElementChangeMixin | EventTypeMouseMixin | EventTypeFocusMixin | EventTypeKeyboardMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputPasswordEventMixin
 * @property {ExtendInputPasswordEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendInputPasswordOptionMixin
 *   | ExtendInputPasswordEventMixin
 * } ExtendInputPassword
 */

/**
 * @param {ExtendInputPassword} options -
 */
export const createInputPassword = function (options) {
  return extendComponent(inputPassword, options)
}
