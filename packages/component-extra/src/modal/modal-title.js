import { createComponent, extendComponent } from '@dooksa/create-component'
import { createText } from '@dooksa/component-base'

const modalText = createText({
  options: {
    value: 'Modal title...'
  }
})

export const modalTitle = createComponent({
  id: 'modal-title',
  tag: 'div',
  children: [modalText],
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
export const createModalTitle = function (options) {
  return extendComponent(modalTitle, options)
}

