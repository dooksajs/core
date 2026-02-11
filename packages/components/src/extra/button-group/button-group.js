import { extendComponent, createComponent } from '@dooksa/create-component'
import { createButton, createText } from '@dooksa/components/base'
import { ariaLabelMixin } from '@dooksa/components/mixins'

const leftText = createText({
  options: {
    value: 'Left'
  }
})

const middleText = createText({
  options: {
    value: 'Middle'
  }
})

const rightText = createText({
  options: {
    value: 'Right'
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
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {AriaLabelMixin} from '#mixins'
 */

/**
 * @typedef {Object} ButtonGroupExtend
 * @property {AriaLabelMixin} [options]
 */

/**
 * @param {ComponentExtend & ButtonGroupExtend} options -
 */
export const createButtonGroup = function (options) {
  return extendComponent(buttonGroup, options)
}
