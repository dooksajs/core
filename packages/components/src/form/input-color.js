import { createComponent, extendComponent } from '@dooksa/create-component'
import { formControlMixin, inputAllMixin } from '../mixins/index.js'

const inputColor = createComponent({
  id: 'input-color',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'color'
    },
    {
      name: 'title',
      value: 'Choose a color'
    },
    {
      name: 'value',
      value: '#563d7c'
    },
    {
      name: 'className',
      value: 'form-control form-control-color'
    }
  ],
  content: [
    {
      name: 'value',
      nodePropertyName: 'value'
    },
    {
      name: 'title',
      nodePropertyName: 'value'
    }
  ],
  options: {
    title: {
      name: 'title'
    },
    id: {
      name: 'id'
    }
  }
}, [formControlMixin, inputAllMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/styles/form-control.js').FormControlMixin} FormControlMixin
 * @typedef {import('../mixins/input/input-all.js').InputAllMixin} InputAllMixin
 */

/**
 * @typedef {Object} ComponentExtendInputTextColorOptions
 * @property {string} [title]
 * @property {string} [id]
 */

/**
 * @typedef {Object} ComponentExtendInputTextColor
 * @property {ComponentExtendInputTextColorOptions|FormControlMixin|InputAllMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendInputTextColor} options
 */
function extendInputColor (options) {
  return extendComponent(inputColor, options)
}

export {
  inputColor,
  extendInputColor
}

export default inputColor
