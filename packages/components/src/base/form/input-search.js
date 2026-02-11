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

export const inputSearch = createComponent({
  id: 'input-search',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'search'
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
 * @typedef {Object} ExtendInputSearchOptions
 * @property {string} [list]
 * @property {number} [size]
 * @property {string} [id]
 */

/**
 * @typedef {Object} ExtendInputSearchOptionMixin
 * @property {ExtendInputSearchOptions |
 *   IdMixin |
 *   FormControlMixin |
 *   InputAllMixin |
 *   InputTextMixin |
 *   AriaLabelMixin
 * } [options]
 */

/**
 * @typedef {Object} ExtendInputSearchEvent
 * @property {EventTypeElementChangeMixin | EventTypeMouseMixin | EventTypeFocusMixin | EventTypeKeyboardMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputSearchEventMixin
 * @property {ExtendInputSearchEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendInputSearchOptionMixin
 *   | ExtendInputSearchEventMixin
 * } ExtendInputSearch
 */

/**
 * @param {ExtendInputSearch} options -
 */
export const createInputSearch = function (options) {
  return extendComponent(inputSearch, options)
}
