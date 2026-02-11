import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  dimensionMixin,
  eventTypeMouseMixin,
  eventTypeFocusMixin,
  eventTypeKeyboardMixin,
  idMixin,
  inputAllMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
} from '@dooksa/components/mixins'

export const inputImage = createComponent({
  id: 'input-image',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'image'
    }
  ],
  options: {
    src: { name: 'src' },
    alt: { name: 'alt' },
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
  dimensionMixin,
  eventTypeMouseMixin,
  eventTypeFocusMixin,
  eventTypeKeyboardMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
])

/**
 * @import {
 *   DimensionMixin,
 *   EventTypeMouseMixin,
 *   EventTypeFocusMixin,
 *   EventTypeKeyboardMixin,
 *   IdMixin,
 *   InputAllMixin,
 *   EventTypeElementDragDropMixin,
 *   EventTypeTouchMixin
 * } from '@dooksa/components/mixins'
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendInputImageOptions
 * @property {string} [id]
 * @property {string} [src]
 * @property {string} [alt]
 * @property {string} [formAction]
 * @property {'application/x-www-form-urlencoded'|'multipart/form-data'|'text/plain'} [formEnctype]
 * @property {'get'|'post'|'dialog'} [formMethod]
 * @property {boolean} [formNoValidate]
 * @property {'_self'|'_blank'|'_parent'|'_top'} [formTarget]
 */

/**
 * @typedef {Object} ExtendInputImageOptionMixin
 * @property {ExtendInputImageOptions |
 *   DimensionMixin |
 *   IdMixin |
 *   InputAllMixin
 * } [options]
 */

/**
 * @typedef {Object} ExtendInputImageEvent
 * @property {EventTypeMouseMixin | EventTypeFocusMixin | EventTypeKeyboardMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputImageEventMixin
 * @property {ExtendInputImageEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendInputImageOptionMixin
 *   | ExtendInputImageEventMixin
 * } ExtendInputImage
 */

/**
 * @param {ExtendInputImage} options -
 */
export const createInputImage = function (options) {
  return extendComponent(inputImage, options)
}
