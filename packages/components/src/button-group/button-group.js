import { button, extendButton } from '../button/button.js'
import { extendComponent, createComponent } from '@dooksa/create-component'
import { extendText } from '../text/text.js'

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

const buttonGroup = createComponent({
  id: 'button-group',
  children: [leftBtn, middleBtn, rightBtn],
  allowedChildren: [button],
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
  ],
  options: {
    ariaLabel: {
      name: 'aria-label'
    }
  }
})

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 */

/**
 * @typedef {Object} ButtonGroupExtendOption
 * @property {string} [ariaLabel]
 */

/**
 * @typedef {Object} ButtonGroupExtend
 * @property {ButtonGroupExtendOption} options
 */

/**
 * @param {ComponentExtend|ButtonGroupExtend} options
 */
function extendButtonGroup (options) {
  return extendComponent(buttonGroup, options)
}

export {
  buttonGroup,
  extendButtonGroup
}

export default buttonGroup
