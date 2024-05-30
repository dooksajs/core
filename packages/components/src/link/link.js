import { createComponent, modifyComponent } from '@dooksa/create-component'
import { card, text, container } from '../index.js'

const linkText = modifyComponent(text, { text: 'Link text...' })

export default createComponent({
  id: 'link',
  tag: 'a',
  children: [linkText],
  allowedChildren: [card, container, linkText],
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
