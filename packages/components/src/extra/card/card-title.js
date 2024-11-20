import { createComponent, extendComponent } from '@dooksa/create-component'
import { createText } from '@dooksa/components/base'

const cardTitleText = createText({
  options: {
    value: 'Card title'
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
export const createCardTitle = function (options) {
  return extendComponent(cardTitle, options)
}