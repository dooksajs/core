import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  buttonMixin,
  eventTypeMouseMixin,
  eventTypeFocusMixin,
  eventTypeKeyboardMixin,
  idMixin,
  inputAllMixin,
  roundedMixin,
  spacingMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
} from '@dooksa/components/mixins'

export const inputReset = createComponent({
  id: 'input-reset',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'reset'
    },
    {
      name: 'className',
      value: 'btn'
    }
  ],
  content: [
    {
      name: 'value',
      nodePropertyName: 'value'
    }
  ]
}, [
  idMixin,
  inputAllMixin,
  buttonMixin,
  spacingMixin,
  roundedMixin,
  eventTypeMouseMixin,
  eventTypeFocusMixin,
  eventTypeKeyboardMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
])

/**
 * @import {
 *   ButtonMixin,
 *   EventTypeMouseMixin,
 *   EventTypeFocusMixin,
 *   EventTypeKeyboardMixin,
 *   SpacingMixin,
 *   RoundedMixin,
 *   IdMixin,
 *   InputAllMixin,
 *   EventTypeElementDragDropMixin,
 *   EventTypeTouchMixin
 * } from '@dooksa/components/mixins'
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendInputResetOptions
 * @property {string} [id]
 */

/**
 * @typedef {Object} ExtendInputResetOptionMixin
 * @property {ExtendInputResetOptions |
 *   ButtonMixin |
 *   SpacingMixin |
 *   RoundedMixin |
 *   IdMixin |
 *   InputAllMixin
 * } [options]
 */

/**
 * @typedef {Object} ExtendInputResetEvent
 * @property {EventTypeMouseMixin | EventTypeFocusMixin | EventTypeKeyboardMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputResetEventMixin
 * @property {ExtendInputResetEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendInputResetOptionMixin
 *   | ExtendInputResetEventMixin
 * } ExtendInputReset
 */

/**
 * @param {ExtendInputReset} options -
 */
export const createInputReset = function (options) {
  return extendComponent(inputReset, options)
}
