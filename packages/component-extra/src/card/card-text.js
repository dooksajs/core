import { createComponent, extendComponent } from '@dooksa/create-component'
import { extendText } from '@dooksa/component-base'

const cardTextText = extendText({
  options: {
    text: 'Some quick example text to build on the card title and make up the bulk of the card\'s content.'
  }
})

export const cardText = createComponent({
  id: 'cardText',
  tag: 'p',
  children: [cardTextText],
  properties: [
    {
      name: 'className',
      value: 'card-text'
    }
  ]
})

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 */

/**
 * @param {ComponentExtend} options
 */
export const extendCardText = function (options) {
  return extendComponent(cardText, options)
}
