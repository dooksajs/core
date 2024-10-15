import { createComponent, extendComponent } from '@dooksa/create-component'
import { modalTitle } from './modal-title.js'
import { createButton } from '@dooksa/component-base'
import {
  backgroundMixin, displayMixin, flexMixin
} from '@dooksa/component-mixins'

const closeBtn = createButton({
  options: {
    btnClose: true
  }
})

export const modalHeader = createComponent({
  id: 'modal-header',
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
 * @typedef {import('@dooksa/component-mixins/src/styles/background.js').BackgroundMixin} BackgroundMixin
 * @typedef {import('@dooksa/component-mixins/src/styles/display.js').DisplayMixin} DisplayMixin
 * @typedef {import('@dooksa/component-mixins/src/styles/flex.js').FlexMixin} FlexMixin
 */

/**
 * @typedef {Object} ExtendModalHeader
 * @property {BackgroundMixin|DisplayMixin|FlexMixin} options
 */

/**
 * @param {ComponentExtend|ExtendModalHeader} options
 */
export const createModalHeader = function (options) {
  return extendComponent(modalHeader, options)
}
