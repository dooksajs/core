import { createComponent, extendComponent } from '@dooksa/create-component'
import { extendText } from '../content/text.js'

const anchorText = extendText({
  options: {
    text: 'Link text...'
  }
})

const anchor = createComponent({
  id: 'anchor',
  tag: 'a',
  children: [anchorText],
  properties: [
    {
      name: 'href',
      value: ''
    }
  ],
  content: [
    {
      name: 'href',
      nodePropertyName: 'href'
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
