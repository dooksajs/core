import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  backgroundMixin,
  borderMixin,
  displayMixin,
  fontMixin,
  gapMixin,
  positionMixin,
  sizingMixin,
  spacingMixin,
  textColorMixin
} from '@dooksa/components/mixins'

export const tr = createComponent({
  id: 'tr',
  tag: 'tr'
}, [
  backgroundMixin,
  borderMixin,
  displayMixin,
  fontMixin,
  gapMixin,
  positionMixin,
  sizingMixin,
  spacingMixin,
  textColorMixin
])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {
 *   BackgroundMixin,
 *   BorderMixin,
 *   DisplayMixin,
 *   FontMixin,
 *   GapMixin,
 *   PositionMixin,
 *   SizingMixin,
 *   SpacingMixin,
 *   TextColorMixin
 * } from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ExtendTrOptionMixin
 * @property {BackgroundMixin
 * | BorderMixin
 * | DisplayMixin
 * | FontMixin
 * | GapMixin
 * | PositionMixin
 * | SizingMixin
 * | SpacingMixin
 * | TextColorMixin} [options]
 */

/**
 * @typedef {ComponentExtend & ExtendTrOptionMixin} ExtendTr
 */

/**
 * @param {ExtendTr} options
 */
export const createTr = function (options) {
  return extendComponent(tr, options)
}
