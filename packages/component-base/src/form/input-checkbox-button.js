import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  ariaControlsMixin, ariaExpandedMixin, eventTypeElementChangeMixin, inputAllMixin, inputCheckboxMixin
} from '@dooksa/component-mixins'

export const inputCheckboxButton = createComponent({
  id: 'input-checkbox-button',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'checkbox'
    },
    {
      name: 'className',
      value: 'btn-check'
    },
    {
      name: 'autocomplete',
      value: 'off'
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
    'observeProperty/checked': true,
  }
}, [inputAllMixin, inputCheckboxMixin, ariaExpandedMixin, ariaControlsMixin, eventTypeElementChangeMixin])

/**
 * @import {InputAllMixin, InputCheckboxMixin, AriaControlsMixin, AriaExpandedMixin, EventTypeElementChangeMixin} from '@dooksa/component-mixins'
 * @import {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ComponentExtendInputCheckboxButtonOptions
 * @property {string} [id]
 */

/**
 * @typedef {Object} ComponentExtendInputCheckboxButton
 * @property {ComponentExtendInputCheckboxButtonOptions|InputCheckboxMixin|InputAllMixin|AriaExpandedMixin|AriaControlsMixin} options
 */

/**
 * @typedef {Object} ComponentExtendEventInputCheckboxButton
 * @property {'observeProperty/checked'|EventTypeElementChangeMixin} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ComponentExtendEvent
 * @property {ComponentExtendEventInputCheckboxButton[]} events
 */

/**
 * @param {ComponentExtend|ComponentExtendInputCheckboxButton|ComponentExtendEvent} options
 */
export const extendInputCheckboxButton = function (options) {
  return extendComponent(inputCheckboxButton, options)
}
