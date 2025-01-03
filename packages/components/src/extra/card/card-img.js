import { createComponent, extendComponent } from '@dooksa/create-component'

export const cardImg = createComponent({
  id: 'card-img',
  tag: 'img',
  type: 'img',
  properties: [
    {
      name: 'src',
      value: ''
    },
    {
      name: 'className',
      value: 'card-img-top'
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
  ],
  options: {
    src: {
      name: 'src'
    },
    position: {
      top: {
        name: 'className',
        value: 'card-img-top'
      },
      bottom: {
        name: 'className',
        value: 'card-img-bottom'
      }
    }
  }
})

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ComponentExtendCardImgOptions
 * @property {string} [src]
 * @property {'top'|'bottom'} [position]
 */

/**
 * @typedef {Object} ComponentExtendCardImg
 * @property {ComponentExtendCardImgOptions} [options]
 */

/**
 * @param {ComponentExtend & ComponentExtendCardImg} options
 */
export const createCardImg = function (options) {
  return extendComponent(cardImg, options)
}
