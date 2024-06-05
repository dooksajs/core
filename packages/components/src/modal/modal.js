import { createComponent, extendComponent } from '@dooksa/create-component'
import modalDialog from './modal-dialog.js'

const modal = createComponent({
  id: 'modal',
  tag: 'div',
  children: [modalDialog],
  properties: [
    {
      name: 'className',
      value: 'modal fade'
    },
    {
      name: 'tabindex',
      value: '-1'
    },
    {
      name: 'aria-hidden',
      value: 'true'
    },
    {
      name: 'role',
      value: 'dialog'
    },
    {
      name: 'aria-modal',
      value: 'true'
    }
  ],
  options: {
    ariaLabel: {
      name: 'aria-label'
    }
  },
  styles: [
    {
      name: 'btn-padding-x',
      type: 'unit'
    },
    {
      name: 'btn-font-family',
      type: 'font-family'
    },
    {
      name: 'btn-font-weight',
      type: 'unit'
    },
    {
      name: 'btn-line-height',
      type: 'number'
    },
    {
      name: 'btn-color',
      type: 'rgba'
    },
    {
      name: 'btn-bg',
      type: 'rgba'
    },
    {
      name: 'btn-border-width',
      type: 'unit'
    },
    {
      name: 'btn-border-color',
      type: 'rgba'
    },
    {
      name: 'btn-border-radius',
      type: 'unit'
    },
    {
      name: 'btn-hover-border-color',
      type: 'rgba'
    },
    {
      name: 'btn-box-shadow',
      type: 'box-shadow'
    },
    {
      name: 'btn-disabled-opacity',
      type: 'unit'
    },
    {
      name: 'btn-focus-box-shadow',
      type: 'box-shadow'
    }
  ]
})

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 */

/**
 * @typedef {Object} ExtendModalAria
 * @property {string} [ariaLabel]
 */

/**
 * @typedef {Object} ExtendModalOptions
 * @property {ExtendModalAria} options
 */

/**
 * @param {ComponentExtend|ExtendModalOptions} options
 */
function extendModal (options) {
  return extendComponent(modal, options)
}

export {
  modal,
  extendModal
}

export default modal
