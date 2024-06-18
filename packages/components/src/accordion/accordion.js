import createComponent from '@dooksa/create-component'
import accordionItem from './accordion-item.js'

export default createComponent({
  id: 'accordion',
  tag: 'div',
  allowedChildren: [accordionItem],
  properties: [
    {
      name: 'className',
      value: 'accordion'
    }
  ],
  options: {
    flush: {
      name: 'className',
      value: 'accordion-flush'
    }
  },
  events: [
    {
      on: 'create',
      actionId: 'on-create-accordion'
    }
  ]
})
