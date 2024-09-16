import { extendComponent, createComponent } from '@dooksa/create-component'

export const accordionBody = createComponent({
  id: 'accordion-body',
  tag: 'div',
  children: [],
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
export const extendAccordionBody = function (options) {
  return extendComponent(accordionBody, options)
}
