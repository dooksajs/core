import { createComponent, extendComponent } from '@dooksa/create-component'
import { icon, extendText } from '../index.js'

const modalText = extendText({
  options: { text: 'Modal title...' }
})

const modalTitle = createComponent({
  id: 'modal-title',
  tag: 'div',
  children: [modalText],
  allowedChildren: [modalText, icon],
  properties: [
    {
      name: 'className',
      value: 'modal-title'
    }
  ]
})

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 */

/**
 * @param {ComponentExtend} options
 */
function extendModalTitle (options) {
  return extendComponent(modalTitle, options)
}

export {
  modalTitle,
  extendModalTitle
}
