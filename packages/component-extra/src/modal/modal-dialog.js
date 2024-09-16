import { modalContent } from './modal-content.js'
import { createComponent, extendComponent } from '@dooksa/create-component'

export const modalDialog = createComponent({
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

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 */

/**
 * @typedef {Object} ModalOptions
 * @property {'sm'|'lg'|'xl'|'xxl'} [size]
 * @property {'always'|'sm'|'md'|'lg'|'xl'} [fullscreen]
 */

/**
 * @typedef {Object} ExtendModalDialogOptions
 * @property {ModalOptions} options
 */

/**
 * @param {ComponentExtend|ExtendModalDialogOptions} options
 */
export const extendModalDialog = function (options) {
  return extendComponent(modalDialog, options)
}
