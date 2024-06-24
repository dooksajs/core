import { createComponent, extendComponent } from '@dooksa/create-component'
import { extendText } from '../text/text.js'
import { buttonMixin, eventTypeMouseMixin, textMixin } from '../mixins/index.js'
import ariaLabel from '../mixins/aria/aria-label.js'

const labelText = extendText({
  options: {
    text: 'Label'
  },
  events: [
    {
      on: 'component/create',
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
    formLabel: {
      name: 'className',
      value: 'form-label',
      toggle: true
    },
    for: {
      name: 'htmlFor'
    },
    id: {
      name: 'id'
    }
  },
  events: [
    {
      on: 'component/mount',
      actionId: 'label-html-for'
    }
  ]
}, [textMixin, buttonMixin, ariaLabel, eventTypeMouseMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/styles/text.js').TextMixin} TextMixin
 * @typedef {import('../mixins/styles/button.js').ButtonMixin} ButtonMixin
 * @typedef {import('../mixins/aria/aria-label.js').AriaLabelMixin} AriaLabelMixin
 */

/**
 * @typedef {Object} ComponentExtendLabelOptions
 * @property {string} [placeholder]
 * @property {boolean} [disabled]
 * @property {boolean} [readonly]
 * @property {boolean} [required]
 * @property {string} [id]
 * @property {string} [for]
 * @property {string} [formLabel]
 */

/**
 * @typedef {Object} ComponentExtendLabel
 * @property {ComponentExtendLabelOptions|TextMixin|ButtonMixin|AriaLabelMixin} options
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
