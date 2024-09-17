import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  ariaControlsMixin,
  ariaExpandedMixin,
  eventTypeElementChangeMixin,
  eventTypeMouseMixin,
  inputAllMixin,
  inputCheckboxMixin
} from '@dooksa/component-mixins'

export const inputCheckbox = createComponent({
  id: 'input-checkbox',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'checkbox'
    },
    {
      name: 'className',
      value: 'form-check-input'
    }
  ],
  content: [
    {
      name: 'checked',
      nodePropertyName: 'checked'
    }
  ],
  options: {
    id: {
      name: 'id'
    }
  },
  events: [
    {
      on: 'component/mount',
      actionId: 'label-id'
    }
  ],
  eventTypes: {
    'observeProperty/checked': true
  }
}, [inputAllMixin, inputCheckboxMixin, ariaExpandedMixin, ariaControlsMixin, eventTypeMouseMixin, eventTypeElementChangeMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {InputAllMixin, InputCheckboxMixin, AriaControlsMixin, AriaExpandedMixin, EventTypeMouseMixin, EventTypeElementChangeMixin} from '@dooksa/component-mixins'
 */

/**
 * @typedef {Object} ComponentExtendInputTextOptions
 * @property {string} [id]
 */

/**
 * @typedef {Object} ComponentExtendInputCheckbox
 * @property {ComponentExtendInputTextOptions|InputCheckboxMixin|InputAllMixin|AriaExpandedMixin|AriaControlsMixin} options
 */

/**
 * @typedef {Object} ComponentExtendEventInputCheckbox
 * @property {'observeProperty/checked'|EventTypeMouseMixin|EventTypeElementChangeMixin} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ComponentExtendEvent
 * @property {ComponentExtendEventInputCheckbox[]} events
 */

/**
 * @param {ComponentExtend|ComponentExtendInputCheckbox|ComponentExtendEvent} options
 */
export const extendInputCheckbox = function (options) {
  return extendComponent(inputCheckbox, options)
}
