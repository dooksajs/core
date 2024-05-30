import { createComponent, modifyComponent } from '@dooksa/create-component'
import { text, icon } from '../index.js'

const modalText = modifyComponent(text, { text: 'Modal title...' })

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
