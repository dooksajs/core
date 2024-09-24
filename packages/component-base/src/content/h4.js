import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  spacingMixin, displayMixin, flexMixin
} from '@dooksa/component-mixins'

export const h4 = createComponent({
  id: 'h4',
  tag: 'h4'
}, [spacingMixin, flexMixin, displayMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {FlexMixin, SpacingMixin, DisplayMixin} from '@dooksa/component-mixins'
 */

/**
 * @typedef {Object} ExtendH4OptionMixin
 * @property {FlexMixin|SpacingMixin|DisplayMixin} options
 */

/**
 * @typedef {ComponentExtend|ExtendH4OptionMixin} ExtendH4
 */

/**
 * @param {ExtendH4} options
 */
export const extendH4 = function (options) {
  return extendComponent(h4, options)
}

