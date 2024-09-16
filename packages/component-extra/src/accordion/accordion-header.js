import { createComponent, extendComponent } from '@dooksa/create-component'
import { extendText } from '@dooksa/component-base'

const text = extendText({
  options: {
    text: 'Accordion Item'
  }
})

export const accordionHeader = createComponent({
  id: 'accordion-header',
  tag: 'summary',
  children: [text],
  properties: [
    {
      name: 'className',
      value: 'accordion-button collapsed'
    }
  ]
})

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 */

/**
 * @param {ComponentExtend} options
 */
export const extendAccordionHeader = function (options) {
  return extendComponent(accordionHeader, options)
}
