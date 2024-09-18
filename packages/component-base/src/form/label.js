import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  buttonMixin,
  eventTypeMouseMixin,
  textMixin,
  ariaLabelMixin,
  idMixin
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
      name: 'htmlFor',
      replace: true
    }
  }
}, [idMixin, textMixin, buttonMixin, ariaLabelMixin, eventTypeMouseMixin])

/**
 * @import {IdMixin, EventTypeMouseMixin, TextMixin, ButtonMixin, AriaLabelMixin} from '@dooksa/component-mixins'
 * @import  {ComponentExtend} from '@dooksa/create-component'
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
 * @property {ComponentExtendLabelOptions|IdMixin|TextMixin|ButtonMixin|AriaLabelMixin} options
 */

/**
 * @typedef {Object} ComponentExtendEventLabel
 * @property {EventTypeMouseMixin} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ComponentExtendEvent
 * @property {ComponentExtendEventLabel[]} events
 */

/**
 * @param {ComponentExtend|ComponentExtendLabel|ComponentExtendEvent} options
 */
export const extendLabel = function (options) {
  return extendComponent(label, options)
}
