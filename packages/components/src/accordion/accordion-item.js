import createComponent from '@dooksa/create-component'
import accordionHeader from './accordion-header.js'
import accordionCollapse from './accordion-collapse.js'

export default createComponent({
  id: 'accordion-item',
  tag: 'div',
  children: [accordionHeader, accordionCollapse],
  properties: [
    {
      name: 'className',
      value: 'accordion-item'
    }
  ],
  eventTypes: {
    'hide.bs.collapse': true,
    'hidden.bs.collapse': true,
    'show.bs.collapse': true,
    'shown.bs.collapse': true
  },
  events: [
    {
      on: 'hide.bs.collapse',
      actionId: 'on-collapse-hide-accordion-button'
    },
    {
      on: 'show.bs.collapse',
      actionId: 'on-collapse-show-accordion-button'
    }
  ]
})
