import createComponent from '@dooksa/create-component'
import { extendAccordionButton } from './accordion-button.js'

const accordionButton = extendAccordionButton({
  options: {
    collapsed: true
  }
})

export default createComponent({
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
