import { createComponent, extendComponent } from '@dooksa/create-component'
import { createText } from '@dooksa/components/base'

const cardTextText = createText({
  options: {
    value: 'Some quick example text to build on the card title and make up the bulk of the card\'s content.'
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
 * @import {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @param {ComponentExtend} options
 */
export const createCardText = function (options) {
  return extendComponent(cardText, options)
}
