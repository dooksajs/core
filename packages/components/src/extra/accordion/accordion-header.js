import { extendComponent } from '@dooksa/create-component'
import { createSummary, createText } from '@dooksa/components/base'

const accordionHeaderText = createText({
  options: {
    value: 'Accordion heading'
  }
})

export const accordionHeader = createSummary({
  metadata: { id: 'accordion-header' },
  properties: [
    {
      name: 'className',
      value: 'accordion-button'
    }
  ],
  children: [accordionHeaderText]
})

/**
 * @import {ComponentExtendSummary} from '#base/types'
 */

/**
 * @param {ComponentExtendSummary} options -
 */
export const createAccordionHeader = function (options) {
  return extendComponent(accordionHeader, options)
}
