import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  backgroundMixin,
  borderMixin,
  displayMixin,
  sizingMixin,
  spacingMixin,
  tableColMixin
} from '@dooksa/components/mixins'

export const col = createComponent({
  id: 'col',
  tag: 'col'
}, [
  backgroundMixin,
  borderMixin,
  displayMixin,
  sizingMixin,
  spacingMixin,
  tableColMixin
])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {
 *   BackgroundMixin,
 *   BorderMixin,
 *   DisplayMixin,
 *   SizingMixin,
 *   SpacingMixin,
 *   TableColMixin
 * } from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ExtendColOptionMixin
 * @property {BackgroundMixin | BorderMixin | DisplayMixin | SizingMixin | SpacingMixin | TableColMixin} [options]
 */

/**
 * @typedef {ComponentExtend & ExtendColOptionMixin} ExtendCol
 */

/**
 * @param {ExtendCol} options
 */
export const createCol = function (options) {
  return extendComponent(col, options)
}
