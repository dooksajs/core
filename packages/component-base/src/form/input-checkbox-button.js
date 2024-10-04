import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  ariaControlsMixin,
  ariaExpandedMixin,
  eventTypeElementChangeMixin,
  idMixin,
  inputAllMixin,
  inputCheckboxMixin
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
  events: [
    {
      on: 'component/created',
      actionId: 'label-id'
    }
  ],
  eventTypes: { 'observeProperty/checked': true }
}, [
  idMixin,
  inputAllMixin,
  inputCheckboxMixin,
  ariaExpandedMixin,
  ariaControlsMixin,
  eventTypeElementChangeMixin
])

/**
 * @import {IdMixin, InputAllMixin, InputCheckboxMixin, AriaControlsMixin, AriaExpandedMixin, EventTypeElementChangeMixin} from '@dooksa/component-mixins'
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendInputCheckboxButtonOption
 * @property {string} [id]
 */

/**
 * @typedef {Object} ExtendInputCheckboxButtonMixin
 * @property {ExtendInputCheckboxButtonOption|IdMixin|InputCheckboxMixin|InputAllMixin|AriaExpandedMixin|AriaControlsMixin} options
 */

/**
 * @typedef {Object} ExtendInputCheckboxButtonEvent
 * @property {'observeProperty/checked'|EventTypeElementChangeMixin|ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputCheckboxButtonEventMixin
 * @property {ExtendInputCheckboxButtonEvent[]} events
 */

/**
 * @typedef {ComponentExtend|ExtendInputCheckboxButtonEventMixin|ExtendInputCheckboxButtonMixin} ExtendInputCheckboxButton
 */

/**
 * @param {ExtendInputCheckboxButton} options
 */
export const extendInputCheckboxButton = function (options) {
  return extendComponent(inputCheckboxButton, options)
}
