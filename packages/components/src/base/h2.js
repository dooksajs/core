import { createComponent, extendComponent } from '@dooksa/create-component'
import { spacingMixin, displayMixin, flexMixin } from '../mixins/index.js'

const h2 = createComponent({
  id: 'h2',
  tag: 'h2'
}, [spacingMixin, flexMixin, displayMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/styles/flex.js').FlexMixin} FlexMixin
 * @typedef {import('../mixins/styles/spacing.js').SpacingMixin} SpacingMixin
 * @typedef {import('../mixins/styles/display.js').DisplayMixin} DisplayMixin
 */

/**
 * @typedef {Object} ComponentExtendH2
 * @property {FlexMixin|SpacingMixin|DisplayMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendH2} options
 */
function extendH2 (options) {
  return extendComponent(h2, options)
}

export {
  h2,
  extendH2
}

export default h2
