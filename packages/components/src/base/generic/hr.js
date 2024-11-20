import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  spacingMixin, displayMixin, flexMixin
} from '@dooksa/components/mixins'

export const hr = createComponent({
  id: 'hr',
  tag: 'hr'
}, [spacingMixin, flexMixin, displayMixin])

/**
 * @import {FlexMixin, SpacingMixin, DisplayMixin} from '@dooksa/components/mixins'
 * @import {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendHrOptionMixin
 * @property {FlexMixin|SpacingMixin|DisplayMixin} options
 */

/**
 * @typedef {ComponentExtend|ExtendHrOptionMixin} ExtendHr
 */

/**
 * @param {ExtendHr} options
 */
export const createHr = function (options) {
  return extendComponent(hr, options)
}
