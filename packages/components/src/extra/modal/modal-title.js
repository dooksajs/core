import { createComponent, extendComponent } from '@dooksa/create-component'
import { createText } from '@dooksa/components/base'

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
 * @import {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @param {ComponentExtend} options
 */
export const createModalTitle = function (options) {
  return extendComponent(modalTitle, options)
}

