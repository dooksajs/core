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
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 */

/**
 * @typedef {Object} ComponentExtendText
 * @property {Object} options
 * @property {string} [options.text] - Text
 */

/**
 * @param {ComponentExtend|ComponentExtendText} options
 */
export const extendText = function (options) {
  return extendComponent(text, options)
}