import { extendComponent } from '@dooksa/create-component'
import {
  createSummary, createText
} from '@dooksa/component-base'

const accordionHeaderText = createText({ options: { text: 'Accordion heading' } })

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
 * @import {ComponentExtendSummary} from '@dooksa/component-base'
 */

/**
 * @param {ComponentExtendSummary} options
 */
export const createAccordionHeader = function (options) {
  return extendComponent(accordionHeader, options)
}
