import createComponent from '@dooksa/create-component'
import { extendText } from '../text/text.js'

const cardText = extendText({
  metadata: {
    id: 'card-text'
  },
  options: { text: 'Card title...' },
  events: [
    {
      on: 'created',
      actionId: 'on-create-change-text'
    }
  ]
})

const cardTitle = createComponent({
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

export { cardText, cardTitle }

export default cardTitle
