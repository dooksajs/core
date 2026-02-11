import { borderMixin } from '@dooksa/components/mixins'
import {
  extendComponent, createComponent
} from '@dooksa/create-component'

export const accordionBody = createComponent({
  id: 'accordion-body',
  tag: 'div',
  properties: [
    {
      name: 'className',
      value: 'accordion-body'
    }
  ]
}, [borderMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {BorderMixin} from '#mixins/types'
 */

/**
 * @typedef {Object} ExtendAccordionBodyOption
 * @property {BorderMixin} [options]
 */

/**
 * @typedef {ComponentExtend & ExtendAccordionBodyOption} ExtendAccordionBody
 */

/**
 * @param {ExtendAccordionBody} options -
 */
export const createAccordionBody = function (options) {
  return extendComponent(accordionBody, options)
}
