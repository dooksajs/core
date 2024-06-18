import createComponent from '@dooksa/create-component'
import accordionBody from './accordion-body.js'

export default createComponent({
  id: 'accordion-collapse',
  tag: 'div',
  children: [accordionBody],
  properties: [
    {
      name: 'className',
      value: 'accordion-collapse collapse'
    }
  ],
  options: {
    id: {
      name: 'id'
    },
    show: {
      name: 'className',
      value: 'show'
    },
    hide: {
      name: 'className',
      value: 'hide'
    }
  },
  events: [
    {
      on: 'create',
      actionId: 'on-create-set-option-id'
    },
    {
      on: 'create',
      actionId: 'on-create-accordion-collapse'
    }
  ]
})
