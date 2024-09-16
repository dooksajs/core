import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  spacingMixin, displayMixin, flexMixin
} from '@dooksa/component-mixins'

export const h3 = createComponent({
  id: 'h3',
  tag: 'h3'
}, [spacingMixin, flexMixin, displayMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/styles/flex.js').FlexMixin} FlexMixin
 * @typedef {import('../mixins/styles/spacing.js').SpacingMixin} SpacingMixin
 * @typedef {import('../mixins/styles/display.js').DisplayMixin} DisplayMixin
 */

/**
 * @typedef {Object} ComponentExtendH3
 * @property {FlexMixin|SpacingMixin|DisplayMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendH3} options
 */
export const extendH3 = function (options) {
  return extendComponent(h3, options)
}
