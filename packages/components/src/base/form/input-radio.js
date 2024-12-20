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

export const inputRadio = createComponent({
  id: 'input-radio',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'radio'
    },
    {
      name: 'className',
      value: 'form-check-input'
    }
  ],
  eventTypes: { 'observeProperty/checked': true }
}, [idMixin, inputAllMixin, inputCheckboxMixin, ariaExpandedMixin, ariaControlsMixin, eventTypeMouseMixin, eventTypeElementChangeMixin])

/**
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 * @import {IdMixin, InputAllMixin, InputCheckboxMixin, AriaControlsMixin, AriaExpandedMixin, EventTypeMouseMixin, EventTypeElementChangeMixin} from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ExtendInputTextOption
 * @property {string} [id]
 */

/**
 * @typedef {Object} ExtendInputTextOptionMixin
 * @property {ExtendInputTextOption | IdMixin | InputCheckboxMixin | InputAllMixin | AriaExpandedMixin | AriaControlsMixin} options
 */

/**
 * @typedef {Object} ExtendInputRadioEvent
 * @property {'observeProperty/checked' | EventTypeMouseMixin | EventTypeElementChangeMixin} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputRadioEventMixin
 * @property {ExtendInputRadioEvent[]} events
 */

/**
 * @typedef {ComponentExtend | ExtendInputRadioEventMixin | ExtendInputTextOptionMixin} ExtendInputRadio
 */

/**
 * @param {ExtendInputRadio} [options]
 */
export const createInputRadio = function (options) {
  return extendComponent(inputRadio, options)
}
