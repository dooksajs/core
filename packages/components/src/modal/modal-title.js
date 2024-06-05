import { createComponent } from '@dooksa/create-component'
import { icon, extendText } from '../index.js'

const modalText = extendText({
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
