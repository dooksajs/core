import { modalHeader } from './modal-header.js'
import { modalBody } from './modal-body.js'
import { modalFooter } from './modal-footer.js'
import { createComponent, extendComponent } from '@dooksa/create-component'
import { shadowMixin } from '@dooksa/components/mixins'

export const modalContent = createComponent({
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
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {ShadowMixin} from '#mixins'
 */

/**
 * @typedef {Object} ExtendModalContent
 * @property {ShadowMixin} [options]
 */

/**
 * @param {ComponentExtend & ExtendModalContent} options -
 */
export const createModalContent = function (options) {
  return extendComponent(modalContent, options)
}
