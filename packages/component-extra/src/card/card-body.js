import { createComponent, extendComponent } from '@dooksa/create-component'

export const cardBody = createComponent({
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
export const extendCardBody = function (options) {
  return extendComponent(cardBody, options)
}
