import modalHeader from './modal-header.js'
import modalBody from './modal-body.js'
import modalFooter from './modal-footer.js'
import createComponent from '@dooksa/create-component'

export default createComponent({
  id: 'modal-content',
  tag: 'div',
  children: [modalHeader, modalBody, modalFooter],
  allowedChildren: [modalHeader, modalBody, modalFooter],
  properties: [
    {
      name: 'className',
      value: 'modal-content'
    }
  ]
})
