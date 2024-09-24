import { createComponent, extendComponent } from '@dooksa/create-component'
import { ariaLabelMixin, inputAllMixin } from '@dooksa/component-mixins'

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
}, [ariaLabelMixin, inputAllMixin])

/**
 * @import {AriaLabelMixin, InputAllMixin} from '@dooksa/component-mixins'
 * @import  {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendSelectOption
 * @property {boolean} [multiple]
 * @property {number} [show]
 * @property {'small'|'large'} [size]
 */

/**
 * @typedef {Object} ExtendSelectOptionMixin
 * @property {ExtendSelectOption|AriaLabelMixin|InputAllMixin} options
 */

/**
 * @typedef {ComponentExtend|ExtendSelectOptionMixin} ExtendSelect
 */

/**
 * @param {ExtendSelect} options
 */
export const extendSelect = function (options) {
  return extendComponent(select, options)
}
