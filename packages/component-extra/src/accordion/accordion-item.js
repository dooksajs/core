import { extendComponent } from '@dooksa/create-component'
import { extendDetails } from '@dooksa/component-base'

export const accordionItem = extendDetails({
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
export const extendAccordionItem = function (options) {
  return extendComponent(accordionItem, options)
}
