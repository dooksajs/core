import { createComponent, extendComponent } from '@dooksa/create-component'
import { buttonMixin, eventTypeMouseMixin, roundedMixin, spacingMixin } from '@dooksa/components/mixins'
import { createText } from '../content/text.js'

const btnText = createText({
  options: { value: 'Button' }
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
}, [buttonMixin, eventTypeMouseMixin, spacingMixin, roundedMixin])

/**
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 * @import {ButtonMixin, EventTypeMouseMixin, SpacingMixin, RoundedMixin} from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ExtendButtonOption
 * @property {'submit' | 'reset' | 'button'} [type]
 */

/**
 * @typedef {Object} ExtendButtonOptionMixin
 * @property {ButtonMixin | ExtendButtonOption | SpacingMixin | RoundedMixin} [options]
 */

/**
 * @typedef {Object} ExtendButtonEvent
 * @property {EventTypeMouseMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendButtonEventMixin
 * @property {ExtendButtonEvent[]} events
 */

/**
 * @typedef {ComponentExtend & ExtendButtonOptionMixin | ExtendButtonEventMixin } ExtendButton
 */

/**
 * @param {ExtendButton} options -
 */
export const createButton = function (options) {
  return extendComponent(button, options)
}
