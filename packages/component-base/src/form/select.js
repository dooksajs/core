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
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('@dooksa/component-mixins/src/aria/aria-label.js').AriaLabelMixin} AriaLabelMixin
 * @typedef {import('@dooksa/component-mixins/src/input/input-all.js').InputAllMixin} InputAllMixin
 */

/**
 * @typedef {Object} ExtendSelectOption
 * @property {boolean} [multiple]
 * @property {number} [show]
 * @property {'small'|'large'} [size]
 */

/**
 * @typedef {Object} ExtendSelect
 * @property {ExtendSelectOption|AriaLabelMixin|InputAllMixin} options
 */

/**
 * @param {ComponentExtend|ExtendSelect} options
 */
export const extendSelect = function (options) {
  return extendComponent(select, options)
}
