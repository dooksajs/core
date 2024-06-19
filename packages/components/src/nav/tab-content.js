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
 * @typedef {import('../mixins/styles/flex.js').FlexMixin} FlexMixin
 * @typedef {import('../mixins/styles/border.js').BorderMixin} BorderMixin
 * @typedef {import('../mixins/styles/rounded.js').RoundedMixin} RoundedMixin
 * @typedef {import('../mixins/styles/spacing.js').SpacingMixin} SpacingMixin
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
