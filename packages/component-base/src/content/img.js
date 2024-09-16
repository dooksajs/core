import { createComponent, extendComponent } from '@dooksa/create-component'
import { spacingMixin } from '@dooksa/component-mixins'

export const img = createComponent({
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
      nodePropertyName: 'src'
    },
    {
      name: 'alt',
      nodePropertyName: 'alt'
    }
  ]
}, [spacingMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/styles/spacing.js').SpacingMixin} SpacingMixin
 */

/**
 * @typedef {Object} ComponentExtendImg
 * @property {SpacingMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendImg} options
 */
export const extendImg = function (options) {
  return extendComponent(img, options)
}
