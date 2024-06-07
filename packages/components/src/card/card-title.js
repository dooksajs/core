import { createComponent, extendComponent } from '@dooksa/create-component'
import { extendText } from '../text/text.js'

const cardText = extendText({
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
