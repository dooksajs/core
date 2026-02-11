import { createComponent, extendComponent } from '@dooksa/create-component'

export const accordion = createComponent({
  id: 'accordion',
  tag: 'div',
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
    },
    hover: {
      name: 'className',
      value: 'accordion-hover'
    }
  },
  events: [
    {
      on: 'component/beforeChildren',
      actionId: 'accordion-generate-name'
    }
  ]
})

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendAccordionOption
 * @property {Object} [options]
 * @property {boolean} [options.flush]
 * @property {boolean} [options.hover]
 */

/**
 * @typedef {ComponentExtend & ExtendAccordionOption} ExtendAccordion
 */

/**
 * @param {ExtendAccordion} options -
 */
export const createAccordion = function (options) {
  return extendComponent(accordion, options)
}

