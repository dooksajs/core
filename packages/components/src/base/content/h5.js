import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  spacingMixin, displayMixin, flexMixin
} from '@dooksa/components/mixins'

export const h5 = createComponent({
  id: 'h5',
  tag: 'h5'
}, [spacingMixin, flexMixin, displayMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {FlexMixin, SpacingMixin, DisplayMixin} from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ExtendH5OptionMixin
 * @property {FlexMixin | SpacingMixin | DisplayMixin} [options]
 */

/**
 * @typedef {ComponentExtend & ExtendH5OptionMixin} ExtendH5
 */

/**
 * @param {ExtendH5} options
 */
export const createH5 = function (options) {
  return extendComponent(h5, options)
}
