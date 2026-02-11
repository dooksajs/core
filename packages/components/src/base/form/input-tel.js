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

export const inputTel = createComponent({
  id: 'input-tel',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'tel'
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
 * @typedef {Object} ExtendInputTelOptions
 * @property {string} [list]
 * @property {number} [size]
 * @property {string} [id]
 */

/**
 * @typedef {Object} ExtendInputTelOptionMixin
 * @property {ExtendInputTelOptions |
 *   IdMixin |
 *   FormControlMixin |
 *   InputAllMixin |
 *   InputTextMixin |
 *   AriaLabelMixin
 * } [options]
 */

/**
 * @typedef {Object} ExtendInputTelEvent
 * @property {EventTypeElementChangeMixin | EventTypeMouseMixin | EventTypeFocusMixin | EventTypeKeyboardMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputTelEventMixin
 * @property {ExtendInputTelEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendInputTelOptionMixin
 *   | ExtendInputTelEventMixin
 * } ExtendInputTel
 */

/**
 * @param {ExtendInputTel} options -
 */
export const createInputTel = function (options) {
  return extendComponent(inputTel, options)
}
