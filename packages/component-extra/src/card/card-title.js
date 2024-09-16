import { createComponent, extendComponent } from '@dooksa/create-component'
import { extendText } from '@dooksa/component-base'

const cardTitleText = extendText({
  options: {
    text: 'Card title'
  }
})

export const cardTitle = createComponent({
  id: 'card-title',
  tag: 'h5',
  children: [cardTitleText],
  properties: [
    {
      name: 'className',
      value: 'card-title'
    }
  ]
})

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 */

/**
 * @param {ComponentExtend} options
 */
export const extendCardTitle = function (options) {
  return extendComponent(cardTitle, options)
}
