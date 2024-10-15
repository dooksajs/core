import { extendComponent } from '@dooksa/create-component'
import { createDetails } from '@dooksa/component-base'

export const accordionItem = createDetails({
  metadata: { id: 'accordion-item' },
  properties: [
    {
      name: 'className',
      value: 'accordion-item'
    }
  ]
})

/**
 * @import {ComponentExtendDetails} from '@dooksa/component-base'
 */

/**
 * @param {ComponentExtendDetails} options
 */
export const createAccordionItem = function (options) {
  return extendComponent(accordionItem, options)
}
