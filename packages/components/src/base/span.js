import { createComponent, extendComponent } from '@dooksa/create-component'
import { spacingMixin, displayMixin, flexMixin } from '../mixins/index.js'

const span = createComponent({
  id: 'span',
  tag: 'span'
}, [spacingMixin, flexMixin, displayMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/flex.js').FlexMixin} FlexMixin
 * @typedef {import('../mixins/spacing.js').SpacingMixin} SpacingMixin
 * @typedef {import('../mixins/display.js').DisplayMixin} DisplayMixin
 */

/**
 * @typedef {Object} ComponentExtendSpan
 * @property {FlexMixin|SpacingMixin|DisplayMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendSpan} options
 */
function extendSpan (options) {
  return extendComponent(span, options)
}

export {
  span,
  extendSpan
}

export default span
