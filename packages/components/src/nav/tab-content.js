import { createComponent, extendComponent } from '@dooksa/create-component'
import { borderMixin, flexMixin, roundedMixin, spacingMixin } from '../mixins/index.js'

const tabContent = createComponent({
  id: 'div',
  properties: [
    {
      name: 'className',
      value: 'tab-content'
    }
  ]
}, [flexMixin, borderMixin, roundedMixin, spacingMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/flex.js').FlexMixin} FlexMixin
 * @typedef {import('../mixins/border.js').BorderMixin} BorderMixin
 * @typedef {import('../mixins/rounded.js').RoundedMixin} RoundedMixin
 * @typedef {import('../mixins/spacing.js').SpacingMixin} SpacingMixin
 */

/**
 * @typedef {Object} ComponentExtendTabContentOption
 * @property {BorderMixin|FlexMixin|RoundedMixin|SpacingMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendTabContentOption} options
 */
function extendTabContent (options) {
  return extendComponent(tabContent, options)
}

export {
  extendTabContent,
  tabContent
}

export default tabContent
