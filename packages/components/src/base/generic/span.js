import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  spacingMixin,
  displayMixin,
  flexMixin,
  textColorMixin,
  colorMixin
} from '@dooksa/components/mixins'

const span = createComponent({
  id: 'span',
  tag: 'span'
}, [
  spacingMixin,
  flexMixin,
  displayMixin,
  textColorMixin,
  colorMixin
])

/**
 * @import {FlexMixin, SpacingMixin, DisplayMixin, TextColorMixin, ColorMixin} from '@dooksa/components/mixins'
 * @import {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendSpanMixin
 * @property {FlexMixin
 *   | SpacingMixin
 *   | DisplayMixin
 *   | TextColorMixin
 *   | ColorMixin
 * } [options]
 */

/**
 * @typedef {ComponentExtend & ExtendSpanMixin} ExtendSpan
 */

/**
 * @param {ExtendSpan} options
 */
function createSpan (options) {
  return extendComponent(span, options)
}

export {
  span,
  createSpan
}
