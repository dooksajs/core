import {
  extendComponent, createComponent
} from '@dooksa/create-component'


export const accordionCollapse = createComponent({
  id: 'accordion-collapse',
  tag: 'div',
  properties: [
    {
      name: 'className',
      value: 'accordion-collapse'
    }
  ]
})

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @param {ComponentExtend} options -
 */
export const createAccordionCollapse = function (options) {
  return extendComponent(accordionCollapse, options)
}
