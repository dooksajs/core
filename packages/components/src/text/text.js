import { createComponent, extendComponent } from '@dooksa/create-component'

const text = createComponent({
  id: 'text',
  initialize: () => new Text(''),
  content: [
    {
      name: 'value',
      get: 'nodeValue',
      set: 'nodeValue'
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
function extendTextComponent (options) {
  return extendComponent(text, options)
}

export {
  text,
  extendTextComponent
}

export default text
