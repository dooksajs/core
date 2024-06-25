import { button } from '../index.js'
import { createComponent, extendComponent } from '@dooksa/create-component'
import { backgroundMixin, displayMixin, flexMixin } from '../mixins/index.js'

const modalFooter = createComponent({
  id: 'modal-footer',
  tag: 'div',
  allowedChildren: [button],
  properties: [
    {
      name: 'className',
      value: 'modal-footer'
    }
  ]

}, [backgroundMixin, displayMixin, flexMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/styles/background.js').BackgroundMixin} BackgroundMixin
 * @typedef {import('../mixins/styles/display.js').DisplayMixin} DisplayMixin
 * @typedef {import('../mixins/styles/flex.js').FlexMixin} FlexMixin
 */

/**
 * @typedef {Object} ExtendModalFooter
 * @property {BackgroundMixin|DisplayMixin|FlexMixin} options
 */

/**
 * @param {ComponentExtend|ExtendModalFooter} options
 */
function extendModalFooter (options) {
  return extendComponent(modalFooter, options)
}

export {
  modalFooter,
  extendModalFooter
}
