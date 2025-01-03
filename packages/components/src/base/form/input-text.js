import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  ariaLabelMixin,
  eventTypeElementChangeMixin,
  formControlMixin,
  idMixin,
  inputAllMixin,
  inputTextMixin
} from '@dooksa/components/mixins'

export const inputText = createComponent({
  id: 'input-text',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'text'
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
  ]
}, [idMixin, formControlMixin, inputAllMixin, inputTextMixin, ariaLabelMixin, eventTypeElementChangeMixin])

/**
 * @import {IdMixin, InputAllMixin, InputTextMixin, AriaLabelMixin, FormControlMixin, EventTypeElementChangeMixin } from '@dooksa/components/mixins'
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendInputTextOption
 * @property {string} [id]
 */

/**
 * @typedef {Object} ExtendInputTextOptionMixin
 * @property {ExtendInputTextOption |
 *   IdMixin |
 *   FormControlMixin |
 *   InputAllMixin |
 *   InputTextMixin |
 *   AriaLabelMixin
 * } [options]
 */

/**
 * @typedef {Object} ExtendInputTextEvent
 * @property {EventTypeElementChangeMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputTextEventMixin
 * @property {ExtendInputTextEvent[]} events
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendInputTextOptionMixin
 *   | ExtendInputTextEventMixin
 * } ExtendInputText
 */

/**
 * @param {ExtendInputText} options
 */
export const createInputText = function (options) {
  return extendComponent(inputText, options)
}
