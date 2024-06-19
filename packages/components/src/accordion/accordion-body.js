import { extendComponent, createComponent } from '@dooksa/create-component'
import { extendText } from '../text/text.js'

const text = extendText({
  options: {
    text: 'This is the first item\'s accordion body.'
  }
})

const accordionBody = createComponent({
  id: 'accordion-body',
  tag: 'div',
  children: [text],
  properties: [
    {
      name: 'className',
      value: 'accordion-body'
    }
  ]
})

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 */

/**
 * @param {ComponentExtend} options
 */
function extendAccordionBody (options) {
  return extendComponent(accordionBody, options)
}

export {
  extendAccordionBody,
  accordionBody
}
