import { createComponent, extendComponent } from '@dooksa/create-component'
import { accordionBody } from './accordion-body.js'
import { ariaControlsMixin, ariaExpandedMixin } from '../mixins/index.js'

const accordionCollapse = createComponent({
  id: 'accordion-collapse',
  tag: 'div',
  children: [accordionBody],
  properties: [
    {
      name: 'className',
      value: 'accordion-collapse collapse'
    }
  ],
  options: {
    id: {
      name: 'id'
    },
    show: {
      name: 'className',
      value: 'show'
    },
    hide: {
      name: 'className',
      value: 'hide'
    }
  },
  events: [
    {
      on: 'create',
      actionId: 'on-create-set-option-id'
    },
    {
      on: 'create',
      actionId: 'on-create-accordion-collapse'
    }
  ]
}, [ariaControlsMixin, ariaExpandedMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 */

/**
 * @typedef {Object} ComponentExtendAccordionCollapse
 * @property {Object} options
 * @property {string} [options.id]
 * @property {boolean} [options.show]
 * @property {boolean} [options.hide]
 */

/**
 * @param {ComponentExtend|ComponentExtendAccordionCollapse} options
 */
function extendAccordionCollapse (options) {
  return extendComponent(accordionCollapse, options)
}

export {
  extendAccordionCollapse,
  accordionCollapse
}
