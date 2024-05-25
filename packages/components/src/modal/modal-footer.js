import { button } from '../index.js'
import createComponent from '@dooksa/create-component'


export default createComponent({
  id: 'modal-footer',
  tag: 'div',
  allowedChildren: [button],
  properties: [
    {
      name: 'className',
      value: 'modal-footer'
    }
  ]
})
