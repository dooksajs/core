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
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {SpacingMixin} from '@dooksa/component-mixins'
 */

/**
 * @typedef {Object} ExtendImgOptionMixin
 * @property {SpacingMixin} options
 */

/**
 * @typedef {ComponentExtend|ExtendImgOptionMixin} ExtendImg
 */

/**
 * @param {ExtendImg} options
 */
export const extendImg = function (options) {
  return extendComponent(img, options)
}
