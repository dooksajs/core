import { createComponent, extendComponent } from '@dooksa/create-component'
import { extendText } from '../content/text.js'

const text = extendText({
  options: {
    text: 'Select option'
  }
})

export const selectOption = createComponent({
  id: 'select-option',
  tag: 'option',
  children: [text],
  options: {
    value: {
      name: 'value',
      replace: true
    },
    selected: {
      name: 'selected',
      values: {
        true: true,
        false: false
      }
    }
  }
})

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 */

/**
 * @typedef {Object} ExtendSelectOptionOption
 * @property {boolean} [selected]
 * @property {string} [value]
 */

/**
 * @typedef {Object} ExtendSelectOption
 * @property {ExtendSelectOptionOption} options
 */


/**
 * @param {ComponentExtend|ExtendSelectOption} options
 */
export const extendSelectOption = function (options) {
  return extendComponent(selectOption, options)
}
