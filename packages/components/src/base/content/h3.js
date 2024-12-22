import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  spacingMixin, displayMixin, flexMixin
} from '@dooksa/components/mixins'

export const h3 = createComponent({
  id: 'h3',
  tag: 'h3'
}, [spacingMixin, flexMixin, displayMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {FlexMixin, SpacingMixin, DisplayMixin} from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ExtendH3OptionMixin
 * @property {FlexMixin | SpacingMixin | DisplayMixin} [options]
 */

/**
 * @typedef {ComponentExtend & ExtendH3OptionMixin} ExtendH3
 */

/**
 * @param {ExtendH3} options
 */
export const createH3 = function (options) {
  return extendComponent(h3, options)
}
