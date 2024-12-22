import { createComponent, extendComponent } from '@dooksa/create-component'
import { modalTitle } from './modal-title.js'
import { createButton } from '@dooksa/components/base'
import {
  backgroundMixin, displayMixin, flexMixin
} from '@dooksa/components/mixins'

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
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {BackgroundMixin, DisplayMixin, FlexMixin} from '#mixins'
 */

/**
 * @typedef {Object} ExtendModalHeader
 * @property {BackgroundMixin | DisplayMixin | FlexMixin} [options]
 */

/**
 * @param {ComponentExtend & ExtendModalHeader} options
 */
export const createModalHeader = function (options) {
  return extendComponent(modalHeader, options)
}
