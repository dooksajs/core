import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  buttonMixin,
  eventTypeMouseMixin,
  textMixin,
  ariaLabelMixin,
  idMixin
} from '@dooksa/component-mixins'
import { createText } from '../content/text.js'

const labelText = createText({
  options: { text: 'Label' },
  events: [
    {
      on: 'component/beforeCreate',
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
 * @typedef {Object} ExtendLabelOption
 * @property {string} [placeholder]
 * @property {boolean} [disabled]
 * @property {boolean} [readonly]
 * @property {boolean} [required]
 * @property {string} [id]
 * @property {string} [for]
 * @property {string} [formLabel]
 */

/**
 * @typedef {Object} ExtendLabelOptionMixin
 * @property {ExtendLabelOption|IdMixin|TextMixin|ButtonMixin|AriaLabelMixin} options
 */

/**
 * @typedef {Object} ExtendLabelEvent
 * @property {EventTypeMouseMixin} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendLabelEventMixin
 * @property {ExtendLabelEvent[]} events
 */

/**
 * @typedef {ComponentExtend|ExtendLabelEventMixin|ExtendLabelOptionMixin} ExtendLabel
 */

/**
 * @param {ExtendLabel} options
 */
export const createLabel = function (options) {
  return extendComponent(label, options)
}
