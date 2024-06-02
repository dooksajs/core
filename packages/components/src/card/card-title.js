import { createComponent, modifyComponent } from '@dooksa/create-component'
import text from '../text/text.js'

const cardText = modifyComponent(text, {
  options: { text: 'Card title...' }
})

export default createComponent({
  id: 'card-title',
  tag: 'div',
  children: [cardText],
  allowedChildren: [cardText],
  properties: [
    {
      name: 'className',
      value: 'card-title'
    }
  ]
})
