import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  idMixin,
  nameMixin,
  spacingMixin,
  formControlMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
} from '@dooksa/components/mixins'

export const output = createComponent({
  id: 'output',
  tag: 'output',
  options: {
    for: { name: 'for' },
    form: { name: 'form' }
  }
}, [
  idMixin,
  nameMixin,
  spacingMixin,
  formControlMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
])

/**
 * @import {
 *   SpacingMixin,
 *   IdMixin,
 *   NameMixin,
 *   FormControlMixin,
 *   EventTypeElementDragDropMixin,
 *   EventTypeTouchMixin
 * } from '@dooksa/components/mixins'
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendOutputOptions
 * @property {string} [for]
 * @property {string} [form]
 * @property {IdMixin | SpacingMixin | NameMixin | FormControlMixin} [options]
 */

/**
 * @typedef {Object} ExtendOutputEvent
 * @property {EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendOutputEventMixin
 * @property {ExtendOutputEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendOutputOptions
 *   | ExtendOutputEventMixin
 * } ExtendOutput
 */

/**
 * @param {ExtendOutput} options -
 */
export const createOutput = function (options) {
  return extendComponent(output, options)
}
