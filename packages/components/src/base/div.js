import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  backgroundMixin,
  roundedMixin,
  buttonMixin,
  shadowMixin,
  displayMixin,
  flexMixin,
  insetMixin,
  zIndexMixin,
  positionMixin,
  spacingMixin,
  translateMixin,
  fontMixin,
  borderMixin
} from '../mixins/index.js'

const div = createComponent({
  id: 'div',
  tag: 'div'
}, [
  backgroundMixin,
  roundedMixin,
  positionMixin,
  shadowMixin,
  spacingMixin,
  zIndexMixin,
  insetMixin,
  translateMixin,
  buttonMixin,
  displayMixin,
  flexMixin,
  fontMixin,
  borderMixin
])

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
 * @typedef {import('../mixins/shadow.js').ShadowMixin} ShadowMixin
 * @typedef {import('../mixins/rounded.js').RoundedMixin} RoundedMixin
 * @typedef {import('../mixins/font.js').FontMixin} FontMixin
 * @typedef {import('../mixins/border.js').BorderMixin} BorderMixin
 */

/**
 * @typedef {Object} ExtendDivOptions
 * @property {FontMixin|
 * RoundedMixin|
 * ShadowMixin|
 * BackgroundMixin|
 * FlexMixin|
 * PositionMixin|
 * SpacingMixin|
 * ZIndexMixin|
 * InsetMixin|
 * TranslateMixin|
 * ButtonMixin|
 * DisplayMixin|
 * BorderMixin} options
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
