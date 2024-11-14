import { createComponent, extendComponent } from '@dooksa/create-component'
import { createText } from '../content/text.js'

const text = createText({
  options: {
    value: 'Select option'
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
 * @import  {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendOptionOption
 * @property {boolean} [selected]
 * @property {string} [value]
 */

/**
 * @typedef {Object} ExtendOptionOptionMixin
 * @property {ExtendOptionOption} options
 */

/**
 * @typedef {ComponentExtend|ExtendOptionOptionMixin} ExtendOption
 */

/**
 * @param {ExtendOption} options
 */
export const createOption = function (options) {
  return extendComponent(option, options)
}
