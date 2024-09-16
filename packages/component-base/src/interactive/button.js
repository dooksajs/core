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
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('@dooksa/component-mixins/src/styles/button.js').ButtonMixin} ButtonMixin
 */

/**
 * @typedef {Object} ButtonExtendOption
 * @property {'submit'|'reset'|'button'} [options.type]
 */

/**
 * @typedef {Object} ButtonExtendOptions
 * @property {ButtonMixin|ButtonExtendOption} options
 */

/**
 * @param {ComponentExtend|ButtonExtendOptions} options
 */
export const extendButton = function (options) {
  return extendComponent(button, options)
}
