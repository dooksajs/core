import { extendComponent } from '@dooksa/create-component'
import { createDetails } from '@dooksa/components/base'

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
 * @import {ComponentExtendDetails} from '@dooksa/components/base'
 */

/**
 * @param {ComponentExtendDetails} options -
 */
export const createAccordionItem = function (options) {
  return extendComponent(accordionItem, options)
}
