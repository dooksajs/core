import { createComponent, extendComponent } from '@dooksa/create-component'
import { spacingMixin } from '../mixins/index.js'

const img = createComponent({
  id: 'img',
  tag: 'img',
  properties: [
    {
      name: 'className',
      value: 'img-fluid'
    },
    {
      name: 'src',
      value: ''
    },
    {
      name: 'alt',
      value: ''
    }
  ],
  content: [
    {
      name: 'src',
      propertyName: 'src'
    },
    {
      name: 'alt',
      propertyName: 'alt'
    }
  ]
}, [spacingMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/spacing.js').SpacingMixin} SpacingMixin
 */

/**
 * @typedef {Object} ComponentExtendImg
 * @property {SpacingMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendImg} options
 */
function extendImg (options) {
  return extendComponent(img, options)
}

export {
  img,
  extendImg
}

export default img
