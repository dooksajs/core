import { createComponent, extendComponent } from '@dooksa/create-component'
import { extendText } from '../text/text.js'
import { eventTypeMouseMixin } from '../mixins/index.js'

const text = extendText({
  options: {
    text: 'Accordion Item #1'
  }
})

const accordionButton = createComponent({
  id: 'accordion-button',
  tag: 'button',
  children: [text],
  allowedChildren: [],
  properties: [
    {
      name: 'className',
      value: 'accordion-button'
    }
  ],
  options: {
    ariaControls: {
      name: 'aria-controls'
    },
    ariaExpanded: {
      name: 'aria-expanded',
      values: {
        true: 'true',
        false: 'false'
      }
    },
    collapsed: {
      name: 'className',
      value: 'collapsed',
      toggle: true
    }
  },
  events: [
    {
      on: 'create',
      actionId: 'on-create-accordion-button'
    },
    {
      on: 'click',
      actionId: 'on-click-accordion-button'
    }
  ]
}, [eventTypeMouseMixin])


/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 */

/**
 * @typedef {Object} ComponentExtendAccordionButton
 * @property {Object} options
 * @property {string} [options.ariaControls] - The component which this button controls
 * @property {'true'|'false'} [options.ariaExpanded] - Indicates if component is expanded
 * @property {boolean} [options.collapsed] - Makes the button appear closed
 */

/**
 * @param {ComponentExtend|ComponentExtendAccordionButton} options
 */
function extendAccordionButton (options) {
  return extendComponent(accordionButton, options)
}

export {
  extendAccordionButton,
  accordionButton
}

export default accordionButton
