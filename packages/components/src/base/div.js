import { createComponent, extendComponent } from '@dooksa/create-component'
import { backgroundMixin, buttonMixin, displayMixin, flexMixin, insetMixin, zIndexMixin, positionMixin, spacingMixin, translateMixin } from '../mixins/index.js'

const div = createComponent({
  id: 'div',
  tag: 'div'
}, [backgroundMixin, positionMixin, spacingMixin, zIndexMixin, insetMixin, translateMixin, buttonMixin, displayMixin, flexMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/flex.js').FlexMixin} FlexMixin
 * @typedef {import('../mixins/background.js').BackgroundMixin} BackgroundMixin
 * @typedef {import('../mixins/position.js').PositionMixin} PositionMixin
 * @typedef {import('../mixins/spacing.js').SpacingMixin} SpacingMixin
 * @typedef {import('../mixins/z-index.js').ZIndexMixin} ZIndexMixin
 * @typedef {import('../mixins/inset.js').InsetMixin} InsetMixin
 * @typedef {import('../mixins/translate.js').TranslateMixin} TranslateMixin
 * @typedef {import('../mixins/button.js').ButtonMixin} ButtonMixin
 * @typedef {import('../mixins/display.js').DisplayMixin} DisplayMixin
 */

/**
 * @typedef {Object} ExtendDivOptions
 * @property {BackgroundMixin|FlexMixin|PositionMixin|SpacingMixin|ZIndexMixin|InsetMixin|TranslateMixin|ButtonMixin|DisplayMixin} options
 */

/**
 * @param {ComponentExtend|ExtendDivOptions} options
 */
function extendDiv (options) {
  return extendComponent(div, options)
}

export {
  div,
  extendDiv
}

export default div
