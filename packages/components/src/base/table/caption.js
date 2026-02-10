import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  backgroundMixin,
  displayMixin,
  fontMixin,
  spacingMixin,
  textColorMixin
} from '@dooksa/components/mixins'

export const caption = createComponent({
  id: 'caption',
  tag: 'caption'
}, [
  backgroundMixin,
  displayMixin,
  fontMixin,
  spacingMixin,
  textColorMixin
])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {
 *   BackgroundMixin,
 *   DisplayMixin,
 *   FontMixin,
 *   SpacingMixin,
 *   TextColorMixin
 * } from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ExtendCaptionOptionMixin
 * @property {BackgroundMixin | DisplayMixin | FontMixin | SpacingMixin | TextColorMixin} [options]
 */

/**
 * @typedef {ComponentExtend & ExtendCaptionOptionMixin} ExtendCaption
 */

/**
 * @param {ExtendCaption} options
 */
export const createCaption = function (options) {
  return extendComponent(caption, options)
}
