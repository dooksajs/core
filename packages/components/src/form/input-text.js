import { createComponent, extendComponent } from '@dooksa/create-component'
import { formControl, inputAll, inputText as inputTextMixin } from '../mixins/index.js'

const inputText = createComponent({
  id: 'input-text',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'text'
    },
    {
      name: 'className',
      value: 'form-control'
    }
  ],
  content: [
    {
      name: 'value',
      propertyName: 'value'
    }
  ],
  options: {
    ariaLabel: {
      name: 'aria-label'
    },
    id: {
      name: 'id'
    }
  }
}, [formControl, inputAll, inputTextMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/form-control.js').FormControlMixin} FormControlMixin
 * @typedef {import('../mixins/input/input-all.js').InputAllMixin} InputAllMixin
 * @typedef {import('../mixins/input/input-text.js').InputTextMixin} InputTextMixin
 */

/**
 * @typedef {Object} ComponentExtendInputTextOptions
 * @property {string} [ariaLabel]
 * @property {string} [id]
 */

/**
 * @typedef {Object} ComponentExtendInputText
 * @property {ComponentExtendInputTextOptions|FormControlMixin|InputAllMixin|InputTextMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendInputText} options
 */
function extendInputText (options) {
  return extendComponent(inputText, options)
}

export {
  inputText,
  extendInputText
}

export default inputText
