import { createComponent, extendComponent } from '@dooksa/create-component'
import { buttonMixin, eventTypeMouseMixin } from '@dooksa/component-mixins'
import { extendText } from '../content/text.js'

const btnText = extendText({
  options: {
    text: 'Button'
  }
})

export const button = createComponent({
  id: 'button',
  tag: 'button',
  children: [btnText],
  properties: [
    {
      name: 'type',
      value: 'button'
    },
    {
      name: 'className',
      value: 'btn'
    }
  ],
  options: {
    type: {
      name: 'type',
      values: {
        submit: 'submit',
        reset: 'reset',
        button: 'button'
      }
    }
  }
}, [buttonMixin, eventTypeMouseMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {ButtonMixin, EventTypeMouseMixin} from '@dooksa/component-mixins'
 */

/**
 * @typedef {Object} ComponentExtendButtonOption
 * @property {'submit'|'reset'|'button'} [options.type]
 */

/**
 * @typedef {Object} ComponentExtendButton
 * @property {ButtonMixin|ComponentExtendButtonOption} options
 */

/**
 * @typedef {Object} ComponentExtendEventButton
 * @property {EventTypeMouseMixin} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ComponentExtendEvent
 * @property {ComponentExtendEventButton[]} events
 */

/**
 * @param {ComponentExtend|ComponentExtendButton|ComponentExtendEventButton} options
 */
export const extendButton = function (options) {
  return extendComponent(button, options)
}
