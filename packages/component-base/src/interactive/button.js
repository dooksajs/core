import { createComponent, extendComponent } from '@dooksa/create-component'
import { buttonMixin, eventTypeMouseMixin } from '@dooksa/component-mixins'
import { createText } from '../content/text.js'

const btnText = createText({
  options: { text: 'Button' }
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
 * @typedef {Object} ExtendButtonOption
 * @property {'submit'|'reset'|'button'} [type]
 */

/**
 * @typedef {Object} ExtendButtonOptionMixin
 * @property {ButtonMixin|ExtendButtonOption} options
 */

/**
 * @typedef {Object} ExtendButtonEvent
 * @property {EventTypeMouseMixin} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendButtonEventMixin
 * @property {ExtendButtonEvent[]} events
 */

/**
 * @typedef {ComponentExtend|ExtendButtonEventMixin|ExtendButtonOptionMixin} ExtendButton
 */

/**
 * @param {ExtendButton} options
 */
export const createButton = function (options) {
  return extendComponent(button, options)
}
