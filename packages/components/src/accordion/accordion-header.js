import { createComponent, extendComponent } from '@dooksa/create-component'
import { extendAccordionButton } from './accordion-button.js'

const accordionButton = extendAccordionButton({
  options: {
    collapsed: true
  }
})

const accordionHeader = createComponent({
  id: 'accordion-header',
  tag: 'h2',
  children: [accordionButton],
  properties: [
    {
      name: 'className',
      value: 'accordion-header'
    }
  ]
})

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 */

/**
 * @param {ComponentExtend} options
 */
function extendAccordionHeader (options) {
  return extendComponent(accordionHeader, options)
}

export {
  extendAccordionHeader,
  accordionHeader
}
