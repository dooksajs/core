import { createComponent, extendComponent } from '@dooksa/create-component'
import modalTitle from './modal-title.js'
import { button } from '../index.js'
import { backgroundMixin, displayMixin, flexMixin } from '../mixins/index.js'

const closeBtn = extendComponent(button, {
  options: { btnClose: true }
})

const modalHeader = createComponent({
  id: 'modal-content',
  tag: 'div',
  children: [modalTitle, closeBtn],
  allowedChildren: [modalTitle, closeBtn],
  properties: [
    {
      name: 'className',
      value: 'modal-header'
    }
  ]
}, [backgroundMixin, displayMixin, flexMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/background.js').BackgroundMixin} BackgroundMixin
 * @typedef {import('../mixins/display.js').DisplayMixin} DisplayMixin
 * @typedef {import('../mixins/flex.js').FlexMixin} FlexMixin
 */

/**
 * @typedef {Object} ExtendModalHeader
 * @property {BackgroundMixin|DisplayMixin|FlexMixin} options
 */

/**
 * @param {ComponentExtend|ExtendModalHeader} options
 */
function extendModalHeader (options) {
  return extendComponent(modalHeader, options)
}

export {
  modalHeader,
  extendModalHeader
}

export default modalHeader
