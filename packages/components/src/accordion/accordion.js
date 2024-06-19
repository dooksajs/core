import { createComponent, extendComponent } from '@dooksa/create-component'
import accordionItem from './accordion-item.js'

const accordion = createComponent({
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

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 */

/**
 * @typedef {Object} ComponentExtendAccordion
 * @property {Object} options
 * @property {boolean} [options.flush]
 */

/**
 * @param {ComponentExtend|ComponentExtendAccordion} options
 */
function extendAccordion (options) {
  return extendComponent(accordion, options)
}

export {
  extendAccordion,
  accordion
}
