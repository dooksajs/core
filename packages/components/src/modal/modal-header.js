import createComponent from '@dooksa/create-component'
import modalTitle from './modal-title.js'
import { button } from '../index.js'
import { background } from '../options/index.js'

export default createComponent({
  id: 'modal-content',
  tag: 'div',
  children: [modalTitle, button.modify({ close: 'close' })],
  allowedChildren: [modalTitle, button],
  extendedOptions: [background],
  properties: [
    {
      name: 'className',
      value: 'modal-header'
    }
  ]
})
