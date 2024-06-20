import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  backgroundMixin,
  borderMixin,
  buttonMixin,
  containerMixin,
  displayMixin,
  flexMixin,
  fontMixin,
  gapMixin,
  insetMixin,
  positionMixin,
  roundedMixin,
  shadowMixin,
  spacingMixin,
  translateMixin,
  zIndexMixin
} from '../mixins/index.js'

const div = createComponent({
  id: 'div',
  tag: 'div'
}, [
  backgroundMixin,
  borderMixin,
  buttonMixin,
  containerMixin,
  displayMixin,
  flexMixin,
  fontMixin,
  gapMixin,
  insetMixin,
  positionMixin,
  roundedMixin,
  shadowMixin,
  spacingMixin,
  translateMixin,
  zIndexMixin
])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/styles/flex.js').FlexMixin} FlexMixin
 * @typedef {import('../mixins/styles/background.js').BackgroundMixin} BackgroundMixin
 * @typedef {import('../mixins/styles/position.js').PositionMixin} PositionMixin
 * @typedef {import('../mixins/styles/spacing.js').SpacingMixin} SpacingMixin
 * @typedef {import('../mixins/styles/z-index.js').ZIndexMixin} ZIndexMixin
 * @typedef {import('../mixins/styles/inset.js').InsetMixin} InsetMixin
 * @typedef {import('../mixins/styles/transform-translate.js').TransformTranslateMixin} TransformTranslateMixin
 * @typedef {import('../mixins/styles/button.js').ButtonMixin} ButtonMixin
 * @typedef {import('../mixins/styles/display.js').DisplayMixin} DisplayMixin
 * @typedef {import('../mixins/styles/shadow.js').ShadowMixin} ShadowMixin
 * @typedef {import('../mixins/styles/rounded.js').RoundedMixin} RoundedMixin
 * @typedef {import('../mixins/styles/font.js').FontMixin} FontMixin
 * @typedef {import('../mixins/styles/border.js').BorderMixin} BorderMixin
 * @typedef {import('../mixins/styles/gap.js').GapMixin} GapMixin
 * @typedef {import('../mixins/styles/container.js').ContainerMixin} ContainerMixin
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
 * TransformTranslateMixin|
 * ButtonMixin|
 * DisplayMixin|
 * BorderMixin|
 * GapMixin|
 * ContainerMixin} options
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
