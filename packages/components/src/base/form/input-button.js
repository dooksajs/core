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

export const inputButton = createComponent({
  id: 'input-button',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'button'
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
 * @typedef {Object} ExtendInputButtonOptions
 * @property {string} [id]
 */

/**
 * @typedef {Object} ExtendInputButtonOptionMixin
 * @property {ExtendInputButtonOptions |
 *   ButtonMixin |
 *   SpacingMixin |
 *   RoundedMixin |
 *   IdMixin |
 *   InputAllMixin
 * } [options]
 */

/**
 * @typedef {Object} ExtendInputButtonEvent
 * @property {EventTypeMouseMixin | EventTypeFocusMixin | EventTypeKeyboardMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputButtonEventMixin
 * @property {ExtendInputButtonEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendInputButtonOptionMixin
 *   | ExtendInputButtonEventMixin
 * } ExtendInputButton
 */

/**
 * @param {ExtendInputButton} options -
 */
export const createInputButton = function (options) {
  return extendComponent(inputButton, options)
}
