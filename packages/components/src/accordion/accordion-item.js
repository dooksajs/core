import { createComponent, extendComponent } from '@dooksa/create-component'
import { accordionHeader } from './accordion-header.js'
import { accordionCollapse } from './accordion-collapse.js'

const accordionItem = createComponent({
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

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 */

/**
 * @param {ComponentExtend} options
 */
function extendAccordionItem (options) {
  return extendComponent(accordionItem, options)
}

export {
  extendAccordionItem,
  accordionItem
}
