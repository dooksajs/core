import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  ariaLabelMixin,
  inputAllMixin,
  eventTypeElementChangeMixin,
  idMixin
} from '@dooksa/components/mixins'

export const select = createComponent({
  id: 'select',
  tag: 'select',
  properties: [
    {
      name: 'className',
      value: 'form-select'
    }
  ],
  options: {
    multiple: {
      name: 'multiple',
      value: true
    },
    size: {
      name: 'className',
      values: {
        small: 'form-select-sm',
        large: 'form-select-lg'
      }
    },
    show: {
      name: 'size',
      /**
       * Show number of items
       * @param {number} size
       * @returns {string}
       */
      computedValue (size) {
        return size.toString()
      }
    }
  }
}, [
  ariaLabelMixin,
  inputAllMixin,
  eventTypeElementChangeMixin,
  idMixin
])

/**
 * @import {AriaLabelMixin, InputAllMixin, EventTypeElementChangeMixin, IdMixin} from '@dooksa/components/mixins'
 * @import  {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendSelectOption
 * @property {boolean} [multiple]
 * @property {number} [show]
 * @property {'small'|'large'} [size]
 */

/**
 * @typedef {Object} ExtendSelectOptionMixin
 * @property {ExtendSelectOption|AriaLabelMixin|InputAllMixin|IdMixin} [options]
 */

/**
 * @typedef {Object} ExtendSelectEvent
 * @property {EventTypeElementChangeMixin|ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendSelectEventMixin
 * @property {ExtendSelectEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend|ExtendSelectOptionMixin|ExtendSelectEventMixin} ExtendSelect
 */

/**
 * @param {ExtendSelect} options
 */
export const createSelect = function (options) {
  return extendComponent(select, options)
}
