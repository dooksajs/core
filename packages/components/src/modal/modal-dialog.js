import modalContent from './modal-content.js'
import createComponent from '@dooksa/create-component'

export default createComponent({
  id: 'modal-dialog',
  tag: 'div',
  children: [modalContent],
  properties: [
    {
      name: 'className',
      value: 'modal-dialog'
    }
  ],
  options: {
    size: {
      name: 'className',
      values: {
        xl: 'modal-xl',
        lg: 'modal-lg',
        sm: 'modal-sm'
      }
    },
    fullscreen: {
      name: 'className',
      values: {
        always: 'modal-fullscreen',
        sm: 'modal-fullscreen-sm-down',
        md: 'modal-fullscreen-md-down',
        lg: 'modal-fullscreen-lg-down',
        xl: 'modal-fullscreen-xl-down',
        xxl: 'modal-fullscreen-xxl-down'
      }
    }
  }
})
