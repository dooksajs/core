import { createComponent, extendComponent } from '@dooksa/create-component'
import { spacingMixin, displayMixin, flexMixin } from '../mixins/index.js'

const hr = createComponent({
  id: 'hr',
  tag: 'hr'
}, [spacingMixin, flexMixin, displayMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/flex.js').FlexMixin} FlexMixin
 * @typedef {import('../mixins/spacing.js').SpacingMixin} SpacingMixin
 * @typedef {import('../mixins/display.js').DisplayMixin} DisplayMixin
 */

/**
 * @typedef {Object} ComponentExtendHr
 * @property {FlexMixin|SpacingMixin|DisplayMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendHr} options
 */
function extendHr (options) {
  return extendComponent(hr, options)
}

export {
  hr,
  extendHr
}

export default hr
