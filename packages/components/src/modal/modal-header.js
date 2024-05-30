import { createComponent, modifyComponent } from '@dooksa/create-component'
import modalTitle from './modal-title.js'
import { button } from '../index.js'
import { background } from '../options/index.js'

const closeBtn = modifyComponent(button, { close: 'close' })

export default createComponent({
  id: 'modal-content',
  tag: 'div',
  children: [modalTitle, closeBtn],
  allowedChildren: [modalTitle, closeBtn],
  extendedOptions: [background],
  properties: [
    {
      name: 'className',
      value: 'modal-header'
    }
  ]
})
