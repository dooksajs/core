import { createComponent, extendComponent } from '@dooksa/create-component'
import { spacingMixin, displayMixin, flexMixin } from '../mixins/index.js'

const h5 = createComponent({
  id: 'h5',
  tag: 'h5'
}, [spacingMixin, flexMixin, displayMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/flex.js').FlexMixin} FlexMixin
 * @typedef {import('../mixins/spacing.js').SpacingMixin} SpacingMixin
 * @typedef {import('../mixins/display.js').DisplayMixin} DisplayMixin
 */

/**
 * @typedef {Object} ComponentExtendH5
 * @property {FlexMixin|SpacingMixin|DisplayMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendH5} options
 */
function extendH5 (options) {
  return extendComponent(h5, options)
}

export {
  h5,
  extendH5
}

export default h5
