import createComponent from '@dooksa/create-component'
import { card, modal, button, text, container } from '../index.js'

export default createComponent({
  id: 'root',
  tag: 'div',
  allowedChildren: [card, modal, button, text, container]
})
