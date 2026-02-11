import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  spacingMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
} from '@dooksa/components/mixins'

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
}, [spacingMixin, eventTypeElementDragDropMixin, eventTypeTouchMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {SpacingMixin, EventTypeElementDragDropMixin, EventTypeTouchMixin} from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ExtendImgOptionMixin
 * @property {SpacingMixin} [options]
 */

/**
 * @typedef {ComponentExtend & ExtendImgOptionMixin} ExtendImg
 */

/**
 * @param {ExtendImg} options -
 */
export const createImg = function (options) {
  return extendComponent(img, options)
}
