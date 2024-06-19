import { createComponent, extendComponent } from '@dooksa/create-component'
import { extendText } from '../text/text.js'
import { textMixin } from '../mixins/index.js'

const labelText = extendText({
  options: {
    text: 'Label'
  },
  events: [
    {
      on: 'create',
      actionId: 'on-create-label-text'
    }
  ]
})

const label = createComponent({
  id: 'label',
  tag: 'label',
  type: 'element',
  children: [labelText],
  properties: [
    {
      name: 'type',
      value: 'text'
    },
    {
      name: 'className',
      value: 'form-label'
    }
  ],
  options: {
    for: {
      name: 'htmlFor'
    }
  },
  events: [
    {
      on: 'create',
      actionId: 'on-create-label'
    }
  ]
}, [textMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/styles/form-control.js').FormControlMixin} FormControlMixin
 */

/**
 * @typedef {Object} ComponentExtendLabelOptions
 * @property {string} [placeholder]
 * @property {string} [ariaLabel]
 * @property {boolean} [disabled]
 * @property {boolean} [readonly]
 * @property {boolean} [required]
 * @property {string} [id]
 */

/**
 * @typedef {Object} ComponentExtendLabel
 * @property {ComponentExtendLabelOptions|FormControlMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendLabel} options
 */
function extendLabel (options) {
  return extendComponent(label, options)
}

export {
  label,
  extendLabel
}

export default label
