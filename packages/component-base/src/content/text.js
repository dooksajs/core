import { createComponent, extendComponent } from '@dooksa/create-component'

export const text = createComponent({
  id: 'text',
  tag: '$null',
  initialize: () => new Text(''),
  content: [
    {
      name: 'value',
      nodePropertyName: 'nodeValue'
    }
  ],
  options: {
    text: {
      name: 'nodeValue'
    }
  }
})

/** 
 * @import {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendTextOption
 * @property {Object} options
 * @property {string} [options.text] - Text
 */

/**
 * @typedef {ComponentExtend|ExtendTextOption} ExtendText
 */

/**
 * @param {ExtendText} options
 */
export const extendText = function (options) {
  return extendComponent(text, options)
}
