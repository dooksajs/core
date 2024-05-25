import createComponent from '@dooksa/create-component'
import { text, button, card } from '../index.js'

export default createComponent({
  id: 'container',
  tag: 'div',
  allowedChildren: [card, text, button],
  properties: [
    {
      name: 'className',
      value: 'container'
    }
  ]
})
