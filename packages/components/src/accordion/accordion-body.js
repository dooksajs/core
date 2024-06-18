import createComponent from '@dooksa/create-component'
import { extendText } from '../text/text.js'
const text = extendText({
  options: {
    text: 'This is the first item\'s accordion body.'
  }
})

export default createComponent({
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
