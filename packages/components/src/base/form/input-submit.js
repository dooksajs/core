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

export const inputSubmit = createComponent({
  id: 'input-submit',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'submit'
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
  ],
  options: {
    formAction: { name: 'formaction' },
    formEnctype: {
      name: 'formenctype',
      values: {
        'application/x-www-form-urlencoded': 'application/x-www-form-urlencoded',
        'multipart/form-data': 'multipart/form-data',
        'text/plain': 'text/plain'
      }
    },
    formMethod: {
      name: 'formmethod',
      values: {
        get: 'get',
        post: 'post',
        dialog: 'dialog'
      }
    },
    formNoValidate: {
      name: 'formnovalidate',
      values: {
        true: true,
        false: false
      }
    },
    formTarget: {
      name: 'formtarget',
      values: {
        _self: '_self',
        _blank: '_blank',
        _parent: '_parent',
        _top: '_top'
      }
    }
  }
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
 * @typedef {Object} ExtendInputSubmitOptions
 * @property {string} [id]
 * @property {string} [formAction]
 * @property {'application/x-www-form-urlencoded'|'multipart/form-data'|'text/plain'} [formEnctype]
 * @property {'get'|'post'|'dialog'} [formMethod]
 * @property {boolean} [formNoValidate]
 * @property {'_self'|'_blank'|'_parent'|'_top'} [formTarget]
 */

/**
 * @typedef {Object} ExtendInputSubmitOptionMixin
 * @property {ExtendInputSubmitOptions |
 *   ButtonMixin |
 *   SpacingMixin |
 *   RoundedMixin |
 *   IdMixin |
 *   InputAllMixin
 * } [options]
 */

/**
 * @typedef {Object} ExtendInputSubmitEvent
 * @property {EventTypeMouseMixin | EventTypeFocusMixin | EventTypeKeyboardMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputSubmitEventMixin
 * @property {ExtendInputSubmitEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendInputSubmitOptionMixin
 *   | ExtendInputSubmitEventMixin
 * } ExtendInputSubmit
 */

/**
 * @param {ExtendInputSubmit} options -
 */
export const createInputSubmit = function (options) {
  return extendComponent(inputSubmit, options)
}
