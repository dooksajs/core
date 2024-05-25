import createComponent from '@dooksa/create-component'
import { text } from '../index.js'

const cardText = text.modify({ text: 'Card title...' })

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
