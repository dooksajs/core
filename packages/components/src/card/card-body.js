import { createComponent, extendComponent } from '@dooksa/create-component'

const cardBody = createComponent({
  id: 'card-body',
  tag: 'div',
  properties: [
    {
      name: 'className',
      value: 'card-body'
    }
  ]
})

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 */

/**
 * @param {ComponentExtend} options
 */
function extendCardBody (options) {
  return extendComponent(cardBody, options)
}

export {
  cardBody,
  extendCardBody
}
