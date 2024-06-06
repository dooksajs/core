import { createComponent, extendComponent } from '@dooksa/create-component'
import { buttonMixin, eventTypeMouseMixin } from '../mixins/index.js'
import { extendText } from '../text/text.js'
import { extendIcon } from '../icon/icon.js'

const btnText = extendText({
  options: { text: 'Button' }
})
const btnIcon = extendIcon({
  options: { icon: 'material-symbols:info-outline' }
})

const button = createComponent({
  id: 'button',
  tag: 'button',
  children: [btnText, btnIcon],
  allowedChildren: [btnText, btnIcon],
  properties: [
    {
      name: 'type',
      value: 'button'
    },
    {
      name: 'className',
      value: 'btn'
    }
  ]
}, [buttonMixin, eventTypeMouseMixin])


/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/button.js').ButtonMixin} ButtonMixin
 */

/**
 * @typedef {Object} ButtonExtendOptions
 * @property {ButtonMixin} options
 */

/**
 * @param {ComponentExtend|ButtonExtendOptions} options
 */
function extendButton (options) {
  return extendComponent(button, options)
}

export {
  button,
  extendButton
}

export default button
