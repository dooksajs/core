import { modalHeader } from './modal-header.js'
import { modalBody } from './modal-body.js'
import { modalFooter } from './modal-footer.js'
import { createComponent, extendComponent } from '@dooksa/create-component'
import { shadowMixin } from '../mixins/index.js'

const modalContent = createComponent({
  id: 'modal-content',
  tag: 'div',
  children: [modalHeader, modalBody, modalFooter],
  allowedChildren: [modalHeader, modalBody, modalFooter],
  properties: [
    {
      name: 'className',
      value: 'modal-content'
    }
  ]
}, [shadowMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/styles/shadow.js').ShadowMixin} ShadowMixin
 */

/**
 * @typedef {Object} ExtendModalContent
 * @property {ShadowMixin} options
 */

/**
 * @param {ComponentExtend|ExtendModalContent} options
 */
function extendModalContent (options) {
  return extendComponent(modalContent, options)
}

export {
  modalContent,
  extendModalContent
}
