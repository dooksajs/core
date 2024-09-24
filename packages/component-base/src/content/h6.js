import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  spacingMixin, displayMixin, flexMixin
} from '@dooksa/component-mixins'

export const h6 = createComponent({
  id: 'h6',
  tag: 'h6'
}, [spacingMixin, flexMixin, displayMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {FlexMixin, SpacingMixin, DisplayMixin} from '@dooksa/component-mixins'
 */

/**
 * @typedef {Object} ExtendH6OptionMixin
 * @property {FlexMixin|SpacingMixin|DisplayMixin} options
 */

/**
 * @typedef {ComponentExtend|ExtendH6OptionMixin} ExtendH6
 */

/**
 * @param {ExtendH6} options
 */
export const extendH6 = function (options) {
  return extendComponent(h6, options)
}
