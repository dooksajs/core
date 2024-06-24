import { createComponent, extendComponent } from '@dooksa/create-component'

const text = createComponent({
  id: 'text',
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
function extendText (options) {
  return extendComponent(text, options)
}

export {
  text,
  extendText
}

export default text
