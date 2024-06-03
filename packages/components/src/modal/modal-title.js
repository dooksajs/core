import { createComponent, extendComponent } from '@dooksa/create-component'
import { text, icon } from '../index.js'

const modalText = extendComponent(text, {
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
