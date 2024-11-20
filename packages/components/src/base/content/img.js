import { createComponent, extendComponent } from '@dooksa/create-component'
import { spacingMixin } from '@dooksa/components/mixins'

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
  options: {
    src: {
      name: 'src'
    },
    alt: {
      name: 'alt'
    }
  }
}, [spacingMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {SpacingMixin} from '@dooksa/components/mixins'
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
export const createImg = function (options) {
  return extendComponent(img, options)
}
