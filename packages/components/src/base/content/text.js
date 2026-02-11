import { createComponent, extendComponent } from '@dooksa/create-component'

export const text = createComponent({
  id: 'text',
  tag: '$null',
  initialize: () => new Text(''),
  options: {
    value: {
      name: 'nodeValue'
    }
  }
})

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendTextOption
 * @property {Object} [options]
 * @property {string} options.value - Text
 */

/**
 * @typedef {ComponentExtend & ExtendTextOption} ExtendText
 */

/**
 * @param {ExtendText} options -
 */
export const createText = function (options) {
  return extendComponent(text, options)
}
