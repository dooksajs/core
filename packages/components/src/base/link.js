import { createComponent, extendComponent } from '@dooksa/create-component'
import text from '../text/text.js'
import card from '../card/card.js'

const linkText = extendComponent(text, {
  options: { text: 'Link text...' }
})

export default createComponent({
  id: 'link',
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
