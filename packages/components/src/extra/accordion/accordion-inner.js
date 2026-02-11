import {
  extendComponent,
  createComponent
} from '@dooksa/create-component'

export const accordionInner = createComponent({
  id: 'accordion-inner',
  tag: 'div',
  properties: [
    {
      name: 'className',
      value: 'accordion-inner'
    }
  ]
})

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @param {ComponentExtend} options -
 */
export const createAccordionInner = function (options) {
  return extendComponent(accordionInner, options)
}
