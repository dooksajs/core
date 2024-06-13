import createComponent from '@dooksa/create-component'
import cardTitle from './card-title.js'

export default createComponent({
  id: 'card-body',
  tag: 'div',
  type: 'section',
  children: [cardTitle],
  allowedChildren: [cardTitle],
  properties: [
    {
      name: 'className',
      value: 'card-body'
    }
  ]
})
