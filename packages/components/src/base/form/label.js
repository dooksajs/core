import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  buttonMixin,
  eventTypeMouseMixin,
  textMixin,
  ariaLabelMixin,
  idMixin
} from '@dooksa/components/mixins'
import { createText } from '../content/text.js'

const labelText = createText({
  options: { value: 'Label' },
  events: [
    {
      on: 'component/beforeChildren',
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
    formCheck: {
      name: 'className',
      value: 'form-check-label',
      replace: true
    },
    for: {
      name: 'htmlFor',
      replace: true
    }
  }
}, [idMixin, textMixin, buttonMixin, ariaLabelMixin, eventTypeMouseMixin])

/**
 * @import {IdMixin, FontMixin, EventTypeMouseMixin, TextMixin, ButtonMixin, AriaLabelMixin} from '@dooksa/components/mixins'
 * @import  {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendLabelOption
 * @property {string} [for] - The for attribute associates a label with a form control.
 * @property {boolean} [formLabel] - Add base styles for a an associated form control input
 * @property {boolean} [formCheck] - Add label styles for an associated checkbox input
 */

/**
 * @typedef {Object} ExtendLabelOptionMixin
 * @property {ExtendLabelOption |
 *   IdMixin |
 *   TextMixin |
 *   ButtonMixin |
 *   FontMixin |
 *   AriaLabelMixin
 * } [options]
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
 * @typedef {ComponentExtend & ExtendLabelOptionMixin | ExtendLabelEventMixin} ExtendLabel
 */

/**
 * @param {ExtendLabel} options
 */
export const createLabel = function (options) {
  return extendComponent(label, options)
}
