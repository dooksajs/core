import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  spacingMixin, textMixin, colorMixin,
  textColorMixin
} from '@dooksa/component-mixins'

export const small = createComponent({
  id: 'small',
  tag: 'small'
}, [spacingMixin, textMixin, colorMixin, textColorMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {TextMixin, ColorMixin, SpacingMixin, TextColorMixin} from '@dooksa/component-mixins'
 */

/**
 * @typedef {Object} ExtendSmallOptionMixin
 * @property {TextMixin|SpacingMixin|ColorMixin|TextColorMixin} options
 */

/**
 * @typedef {ComponentExtend|ExtendSmallOptionMixin} ExtendSmall
 */

/**
 * @param {ExtendSmall} options
 */
export const extendSmall = function (options) {
  return extendComponent(small, options)
}
