import { createComponent, extendComponent } from '@dooksa/create-component'
import { formControl, inputAll } from '../mixins/index.js'

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
      propertyName: 'value'
    },
    {
      name: 'title',
      propertyName: 'value'
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
}, [formControl, inputAll])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/form-control.js').FormControlMixin} FormControlMixin
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
