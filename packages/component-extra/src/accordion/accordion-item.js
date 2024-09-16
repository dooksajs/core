import { createComponent, extendComponent } from '@dooksa/create-component'
import { accordionHeader } from './accordion-header.js'
import { nameMixin } from '@dooksa/component-mixins'
import { accordionBody } from './accordion-body.js'

export const accordionItem = createComponent({
  id: 'accordion-item',
  tag: 'details',
  children: [accordionHeader, accordionBody],
  properties: [
    {
      name: 'className',
      value: 'accordion-item'
    }
  ],
  options: {
    open: {
      name: 'open',
      values: {
        true: true,
        false: false
      }
    }
  },
  eventTypes: {
    toggle: true
  },
  events: [
    {
      on: 'component/create',
      actionId: 'accordion-set-details-name'
    }
  ]
}, [nameMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 */

/**
 * @typedef {Object} ComponentExtendAccordionItem
 * @property {Object} options
 * @property {boolean} [options.open] - This Boolean attribute indicates whether the details — that is, the contents of the <details> element — are currently visible.
 */

/**
 * @param {ComponentExtend|ComponentExtendAccordionItem} options
 */
export const extendAccordionItem = function (options) {
  return extendComponent(accordionItem, options)
}
