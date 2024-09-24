import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  ariaLabelMixin, eventTypeElementChangeMixin, formControlMixin, idMixin, inputAllMixin, inputTextMixin
} from '@dooksa/component-mixins'

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
 * @import {IdMixin, InputAllMixin, InputTextMixin, AriaLabelMixin, FormControlMixin, EventTypeElementChangeMixin } from '@dooksa/component-mixins'
 * @import {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendInputTextOption
 * @property {string} [id]
 */

/**
 * @typedef {Object} ExtendInputTextOptionMixin
 * @property {ExtendInputTextOption|IdMixin|FormControlMixin|InputAllMixin|InputTextMixin|AriaLabelMixin} options
 */

/**
 * @typedef {Object} ExtendInputTextEvent
 * @property {EventTypeElementChangeMixin} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputTextEventMixin
 * @property {ExtendInputTextEvent[]} events
 */

/**
 * @typedef {ComponentExtend|ExtendInputTextEventMixin|ExtendInputTextOptionMixin} ExtendInputText
 */

/**
 * @param {ExtendInputText} options
 */
export const extendInputText = function (options) {
  return extendComponent(inputText, options)
}
