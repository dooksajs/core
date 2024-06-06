import { createComponent, extendComponent } from '@dooksa/create-component'

const modalBody = createComponent({
  id: 'modal-body',
  tag: 'div',
  allowedChildren: [],
  properties: [
    {
      name: 'className',
      value: 'modal-body'
    }
  ]
})


/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 */

/**
 * @param {ComponentExtend} options
 */

function extendModalBody (options) {
  return extendComponent(modalBody, options)
}

export {
  modalBody,
  extendModalBody
}

export default modalBody



