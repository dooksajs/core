import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  spacingMixin, displayMixin, flexMixin
} from '@dooksa/component-mixins'

const span = createComponent({
  id: 'span',
  tag: 'span'
}, [spacingMixin, flexMixin, displayMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('@dooksa/component-mixins/src/styles/flex.js').FlexMixin} FlexMixin
 * @typedef {import('@dooksa/component-mixins/src/styles/spacing.js').SpacingMixin} SpacingMixin
 * @typedef {import('@dooksa/component-mixins/src/styles/display.js').DisplayMixin} DisplayMixin
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
