import { createComponent, extendComponent } from '@dooksa/create-component'
import { text, extendText } from '../text/text.js'

const cardTextText = extendText({
  options: {
    text: 'Some quick example text to build on the card title and make up the bulk of the card\'s content.'
  }
})

const cardText = createComponent({
  id: 'cardText',
  tag: 'p',
  children: [cardTextText],
  allowedChildren: [text],
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
function extendCardText (options) {
  return extendComponent(cardText, options)
}

export {
  cardText,
  extendCardText
}
