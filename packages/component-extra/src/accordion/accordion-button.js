import { createComponent, extendComponent } from '@dooksa/create-component'
import { extendText } from '@dooksa/component-base'
import {
  ariaControlsMixin, ariaExpandedMixin, eventTypeMouseMixin
} from '@dooksa/component-mixins'

const text = extendText({
  options: {
    text: 'Accordion Item #1'
  }
})

export const accordionButton = createComponent({
  id: 'accordion-button',
  tag: 'button',
  children: [text],
  properties: [
    {
      name: 'className',
      value: 'accordion-button collapsed'
    }
  ],
  options: {
    collapsed: {
      name: 'className',
      value: 'collapsed',
      toggle: true
    }
  },
  events: [
    {
      on: 'component/create',
      actionId: 'on-create-accordion-button'
    },
    {
      on: 'node/click',
      actionId: 'on-click-accordion-button'
    }
  ]
}, [eventTypeMouseMixin, ariaControlsMixin, ariaExpandedMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../../mixins/aria/aria-expanded.js').AriaExpandedMixin} AriaExpandedMixin
 * @typedef {import('../../mixins/aria/aria-controls.js').AriaControlsMixin} AriaControlsMixin
 */

/**
 * @typedef {Object} ComponentExtendAccordionButtonOptions
 * @property {boolean} [collapsed] - Makes the button appear closed
 */

/**
 * @typedef {Object} ComponentExtendAccordionButton
 * @property {ComponentExtendAccordionButtonOptions|AriaControlsMixin|AriaExpandedMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendAccordionButton} options
 */
export const extendAccordionButton = function (options) {
  return extendComponent(accordionButton, options)
}

