import createComponent from '@dooksa/create-component'
import { text, icon } from '../index.js'

const modalText = text.modify({ text: 'Modal title...' })
export default createComponent({
  name: 'modal-title',
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
