import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  ariaLabelMixin,
  eventTypeElementChangeMixin,
  formControlMixin,
  idMixin,
  inputAllMixin,
  inputTextMixin,
  eventTypeMouseMixin,
  eventTypeFocusMixin,
  eventTypeKeyboardMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
} from '@dooksa/components/mixins'

export const inputUrl = createComponent({
  id: 'input-url',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'url'
    },
    {
      name: 'className',
      value: 'form-control'
    }
  ],
  content: [
    {
      name: 'value',
      nodePropertyName: 'value'
    }
  ],
  options: {
    list: { name: 'list' },
    size: { name: 'size' }
  }
}, [
  idMixin,
  formControlMixin,
  inputAllMixin,
  inputTextMixin,
  ariaLabelMixin,
  eventTypeElementChangeMixin,
  eventTypeMouseMixin,
  eventTypeFocusMixin,
  eventTypeKeyboardMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
])

/**
 * @import {IdMixin, InputAllMixin, InputTextMixin, AriaLabelMixin, FormControlMixin, EventTypeElementChangeMixin, EventTypeMouseMixin, EventTypeFocusMixin, EventTypeKeyboardMixin, EventTypeElementDragDropMixin, EventTypeTouchMixin } from '@dooksa/components/mixins'
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendInputUrlOptions
 * @property {string} [list]
 * @property {number} [size]
 * @property {string} [id]
 */

/**
 * @typedef {Object} ExtendInputUrlOptionMixin
 * @property {ExtendInputUrlOptions |
 *   IdMixin |
 *   FormControlMixin |
 *   InputAllMixin |
 *   InputTextMixin |
 *   AriaLabelMixin
 * } [options]
 */

/**
 * @typedef {Object} ExtendInputUrlEvent
 * @property {EventTypeElementChangeMixin | EventTypeMouseMixin | EventTypeFocusMixin | EventTypeKeyboardMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputUrlEventMixin
 * @property {ExtendInputUrlEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendInputUrlOptionMixin
 *   | ExtendInputUrlEventMixin
 * } ExtendInputUrl
 */

/**
 * @param {ExtendInputUrl} options -
 */
export const createInputUrl = function (options) {
  return extendComponent(inputUrl, options)
}
