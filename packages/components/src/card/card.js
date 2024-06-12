import createComponent from '@dooksa/create-component'
import cardImg from './card-img.js'
import cardBody from './card-body.js'

export default createComponent({
  id: 'card',
  tag: 'div',
  children: [cardImg, cardBody],
  allowedChildren: [cardBody, cardImg],
  properties: [
    {
      name: 'className',
      value: 'card'
    }
  ],
  events: [
    {
      on: 'created',
      actionId: 'edit-section-inner'
    }
  ]
})
