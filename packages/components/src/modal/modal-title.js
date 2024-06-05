import { createComponent } from '@dooksa/create-component'
import { icon, extendTextComponent } from '../index.js'

const modalText = extendTextComponent({
  options: { text: 'Modal title...' }
})

export default createComponent({
  id: 'modal-title',
  tag: 'div',
  children: [modalText],
  allowedChildren: [modalText, icon],
  properties: [
    {
      name: 'className',
      value: 'modal-title'
    }
  ]
})
