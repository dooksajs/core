import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  ariaLabelMixin, eventTypeElementChangeMixin, formControlMixin, inputAllMixin, inputTextMixin
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
  ],
  options: {
    id: {
      name: 'id'
    },
  }
}, [formControlMixin, inputAllMixin, inputTextMixin, ariaLabelMixin, eventTypeElementChangeMixin])

/**
 * @import {InputAllMixin, InputTextMixin, AriaLabelMixin, FormControlMixin, EventTypeElementChangeMixin } from '@dooksa/component-mixins'
 * @import {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ComponentExtendInputTextOptions
 * @property {string} [id]
 */

/**
 * @typedef {Object} ComponentExtendInputText
 * @property {ComponentExtendInputTextOptions|FormControlMixin|InputAllMixin|InputTextMixin|AriaLabelMixin} options
 */

/**
 * @typedef {Object} ComponentExtendEventInputText
 * @property {EventTypeElementChangeMixin} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ComponentExtendEvent
 * @property {ComponentExtendEventInputText[]} events
 */


/**
 * @param {ComponentExtend|ComponentExtendInputText} options
 */
export const extendInputText = function (options) {
  return extendComponent(inputText, options)
}
