import { extendComponent, createComponent } from '@dooksa/create-component'
import { createButton, createText } from '@dooksa/component-base'
import { ariaLabelMixin } from '@dooksa/component-mixins'

const leftText = createText({
  options: {
    text: 'Left'
  }
})

const middleText = createText({
  options: {
    text: 'Middle'
  }
})

const rightText = createText({
  options: {
    text: 'Right'
  }
})

const leftBtn = createButton({
  children: [leftText],
  options: {
    btnVariant: 'primary'
  }
})

const middleBtn = createButton({
  children: [middleText],
  options: {
    btnVariant: 'primary'
  }
})

const rightBtn = createButton({
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
export const createButtonGroup = function (options) {
  return extendComponent(buttonGroup, options)
}
