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
} from '@dooksa/component-mixins'

export const div = createComponent({
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
 * @typedef {import('@dooksa/component-mixins/src/styles/flex.js').FlexMixin} FlexMixin
 * @typedef {import('@dooksa/component-mixins/src/styles/background.js').BackgroundMixin} BackgroundMixin
 * @typedef {import('@dooksa/component-mixins/src/styles/position.js').PositionMixin} PositionMixin
 * @typedef {import('@dooksa/component-mixins/src/styles/spacing.js').SpacingMixin} SpacingMixin
 * @typedef {import('@dooksa/component-mixins/src/styles/z-index.js').ZIndexMixin} ZIndexMixin
 * @typedef {import('@dooksa/component-mixins/src/styles/inset.js').InsetMixin} InsetMixin
 * @typedef {import('@dooksa/component-mixins/src/styles/transform-translate.js').TransformTranslateMixin} TransformTranslateMixin
 * @typedef {import('@dooksa/component-mixins/src/styles/button.js').ButtonMixin} ButtonMixin
 * @typedef {import('@dooksa/component-mixins/src/styles/display.js').DisplayMixin} DisplayMixin
 * @typedef {import('@dooksa/component-mixins/src/styles/shadow.js').ShadowMixin} ShadowMixin
 * @typedef {import('@dooksa/component-mixins/src/styles/rounded.js').RoundedMixin} RoundedMixin
 * @typedef {import('@dooksa/component-mixins/src/styles/font.js').FontMixin} FontMixin
 * @typedef {import('@dooksa/component-mixins/src/styles/border.js').BorderMixin} BorderMixin
 * @typedef {import('@dooksa/component-mixins/src/styles/gap.js').GapMixin} GapMixin
 * @typedef {import('@dooksa/component-mixins/src/styles/container.js').ContainerMixin} ContainerMixin
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
export const extendDiv = function (options) {
  return extendComponent(div, options)
}
