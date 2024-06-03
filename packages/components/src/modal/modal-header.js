import { createComponent, extendComponent } from '@dooksa/create-component'
import modalTitle from './modal-title.js'
import { button } from '../index.js'
import { background } from '../mixins/index.js'

const closeBtn = extendComponent(button, {
  options: { btnClose: 'close' }
})

export default createComponent({
  id: 'modal-content',
  tag: 'div',
  children: [modalTitle, closeBtn],
  allowedChildren: [modalTitle, closeBtn],
  properties: [
    {
      name: 'className',
      value: 'modal-header'
    }
  ]
}, [background])
