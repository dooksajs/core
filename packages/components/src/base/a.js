import { createComponent, extendComponent } from '@dooksa/create-component'
import text from '../text/text.js'
import card from '../card/card.js'

const linkText = extendComponent(text, {
  options: { text: 'Link text...' }
})

const a = createComponent({
  id: 'a',
  tag: 'a',
  children: [linkText],
  allowedChildren: [card, linkText],
  properties: [
    {
      name: 'href',
      value: ''
    }
  ],
  content: [
    {
      name: 'href',
      get: 'href',
      set: 'href'
    }
  ]
})


/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 */

/**
 * @param {ComponentExtend} options
 */
function extendAComponent (options) {
  return extendComponent(a, options)
}

export {
  a,
  extendAComponent
}

export default a
