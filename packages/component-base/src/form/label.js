import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  buttonMixin, eventTypeMouseMixin, textMixin, ariaLabelMixin
} from '@dooksa/component-mixins'
import { extendText } from '../content/text.js'

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

export const label = createComponent({
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
}, [textMixin, buttonMixin, ariaLabelMixin, eventTypeMouseMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('@dooksa/component-mixins/src/styles/text.js').TextMixin} TextMixin
 * @typedef {import('@dooksa/component-mixins/src/styles/button.js').ButtonMixin} ButtonMixin
 * @typedef {import('@dooksa/component-mixins/src/aria/aria-label.js').AriaLabelMixin} AriaLabelMixin
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
export const extendLabel = function (options) {
  return extendComponent(label, options)
}
