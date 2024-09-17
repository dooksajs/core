import { createComponent, extendComponent } from '@dooksa/create-component'
import { extendText } from '../content/text.js'

const text = extendText({
  options: {
    text: 'Select option'
  }
})

export const option = createComponent({
  id: 'option',
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
 * @typedef {Object} ExtendOptionOption
 * @property {boolean} [selected]
 * @property {string} [value]
 */

/**
 * @typedef {Object} ExtendOption
 * @property {ExtendOptionOption} options
 */

/**
 * @param {ComponentExtend|ExtendOption} options
 */
export const extendOption = function (options) {
  return extendComponent(option, options)
}
