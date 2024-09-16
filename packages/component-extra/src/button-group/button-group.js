import { extendComponent, createComponent } from '@dooksa/create-component'
import { extendButton, extendText } from '@dooksa/component-base'
import { ariaLabelMixin } from '@dooksa/component-mixins'

const leftText = extendText({
  options: {
    text: 'Left'
  }
})

const middleText = extendText({
  options: {
    text: 'Middle'
  }
})

const rightText = extendText({
  options: {
    text: 'Right'
  }
})

const leftBtn = extendButton({
  children: [leftText],
  options: {
    btnVariant: 'primary'
  }
})

const middleBtn = extendButton({
  children: [middleText],
  options: {
    btnVariant: 'primary'
  }
})

const rightBtn = extendButton({
  children: [rightText],
  options: {
    btnVariant: 'primary'
  }
})

export const buttonGroup = createComponent({
  id: 'button-group',
  tag: 'div',
  children: [leftBtn, middleBtn, rightBtn],
  properties: [
    {
      name: 'className',
      value: 'btn-group'
    },
    {
      name: 'role',
      value: 'group'
    },
    {
      name: 'aria-label',
      value: 'Button group'
    }
  ]
}, [ariaLabelMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../../mixins/aria/aria-label.js').AriaLabelMixin} AriaLabelMixin
 */

/**
 * @typedef {Object} ButtonGroupExtend
 * @property {AriaLabelMixin} options
 */

/**
 * @param {ComponentExtend|ButtonGroupExtend} options
 */
export const extendButtonGroup = function (options) {
  return extendComponent(buttonGroup, options)
}
