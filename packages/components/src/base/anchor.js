import { createComponent, extendComponent } from '@dooksa/create-component'
import text from '../text/text.js'
import card from '../card/card.js'

const anchorText = extendComponent(text, {
  options: { text: 'Link text...' }
})

const anchor = createComponent({
  id: 'anchor',
  tag: 'a',
  children: [anchorText],
  allowedChildren: [card, anchorText],
  properties: [
    {
      name: 'href',
      value: ''
    }
  ],
  content: [
    {
      name: 'href',
      propertyName: 'href'
    }
  ]
})

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 */

/**
 * @param {ComponentExtend} options
 */
function extendAnchor (options) {
  return extendComponent(anchor, options)
}

export {
  anchor,
  extendAnchor
}

export default anchor
