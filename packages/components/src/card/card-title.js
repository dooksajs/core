import { createComponent, extendComponent } from '@dooksa/create-component'
import { text, extendText } from '../text/text.js'

const cardTitleText = extendText({
  options: {
    text: 'Card title'
  }
})

const cardTitle = createComponent({
  id: 'card-title',
  tag: 'h5',
  children: [cardTitleText],
  allowedChildren: [text],
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
function extendCardTitle (options) {
  return extendComponent(cardTitle, options)
}

export {
  cardTitle,
  extendCardTitle
}
