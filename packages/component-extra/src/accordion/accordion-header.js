import { extendComponent } from '@dooksa/create-component'
import {
  extendSummary, extendText
} from '@dooksa/component-base'

const accordionHeaderText = extendText({ options: { text: 'Accordion heading' } })

export const accordionHeader = extendSummary({
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
export const extendAccordionHeader = function (options) {
  return extendComponent(accordionHeader, options)
}
