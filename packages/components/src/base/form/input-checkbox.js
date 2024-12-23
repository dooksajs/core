import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  ariaControlsMixin,
  ariaExpandedMixin,
  eventTypeElementChangeMixin,
  eventTypeMouseMixin,
  idMixin,
  inputAllMixin,
  inputCheckboxMixin
} from '@dooksa/components/mixins'

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
  ]
}, [idMixin, inputAllMixin, inputCheckboxMixin, ariaExpandedMixin, ariaControlsMixin, eventTypeMouseMixin, eventTypeElementChangeMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {IdMixin, InputAllMixin, InputCheckboxMixin, AriaControlsMixin, AriaExpandedMixin, EventTypeMouseMixin, EventTypeElementChangeMixin} from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ExtendInputTextOption
 * @property {string} [id]
 */

/**
 * @typedef {Object} ExtendInputTextOptionMixin
 * @property {ExtendInputTextOption
 *   | IdMixin
 *   | InputCheckboxMixin
 *   | InputAllMixin
 *   | AriaExpandedMixin
 *   | AriaControlsMixin
 * } [options]
 */

/**
 * @typedef {Object} ExtendInputCheckboxEvent
 * @property {'observeProperty/checked'
 *   | EventTypeMouseMixin
 *   | EventTypeElementChangeMixin
 * } on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputCheckboxEventMixin
 * @property {ExtendInputCheckboxEvent[]} events
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendInputTextOptionMixin
 *   | ExtendInputCheckboxEventMixin
 * } ExtendInputCheckbox
 */

/**
 * @param {ExtendInputCheckbox} [options]
 */
export const createInputCheckbox = function (options) {
  return extendComponent(inputCheckbox, options)
}
