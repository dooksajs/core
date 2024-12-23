import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  ariaControlsMixin,
  ariaExpandedMixin,
  eventTypeElementChangeMixin,
  idMixin,
  inputAllMixin,
  inputCheckboxMixin
} from '@dooksa/components/mixins'

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
  ]
}, [
  idMixin,
  inputAllMixin,
  inputCheckboxMixin,
  ariaExpandedMixin,
  ariaControlsMixin,
  eventTypeElementChangeMixin
])

/**
 * @import {IdMixin, InputAllMixin, InputCheckboxMixin, AriaControlsMixin, AriaExpandedMixin, EventTypeElementChangeMixin} from '@dooksa/components/mixins'
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendInputCheckboxButtonOption
 * @property {string} [id]
 */

/**
 * @typedef {Object} ExtendInputCheckboxButtonMixin
 * @property {ExtendInputCheckboxButtonOption
 *   | IdMixin
 *   | InputCheckboxMixin
 *   | InputAllMixin
 *   | AriaExpandedMixin
 *   | AriaControlsMixin
 * } [options]
 */

/**
 * @typedef {Object} ExtendInputCheckboxButtonEvent
 * @property {'observeProperty/checked'
 *   | EventTypeElementChangeMixin
 *   | ComponentEventOn
 * } on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputCheckboxButtonEventMixin
 * @property {ExtendInputCheckboxButtonEvent[]} events
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendInputCheckboxButtonMixin
 *   | ExtendInputCheckboxButtonEventMixin
 * } ExtendInputCheckboxButton
 */

/**
 * @param {ExtendInputCheckboxButton} options
 */
export const createInputCheckboxButton = function (options) {
  return extendComponent(inputCheckboxButton, options)
}
