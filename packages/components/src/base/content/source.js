import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  dimensionMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
} from '@dooksa/components/mixins'

export const source = createComponent({
  id: 'source',
  tag: 'source',
  options: {
    src: { name: 'src' },
    type: { name: 'type' },
    srcset: { name: 'srcset' },
    media: { name: 'media' },
    sizes: { name: 'sizes' }
  }
}, [dimensionMixin, eventTypeElementDragDropMixin, eventTypeTouchMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {DimensionMixin, EventTypeElementDragDropMixin, EventTypeTouchMixin} from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ExtendSourceOptions
 * @property {string} [src]
 * @property {string} [type]
 * @property {string} [srcset]
 * @property {string} [media]
 * @property {string} [sizes]
 * @property {DimensionMixin} [options]
 */

/**
 * @typedef {ComponentExtend & ExtendSourceOptions} ExtendSource
 */

/**
 * @param {ExtendSource} options -
 */
export const createSource = function (options) {
  return extendComponent(source, options)
}
