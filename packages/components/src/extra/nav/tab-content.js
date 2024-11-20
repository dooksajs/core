import { createComponent, extendComponent } from '@dooksa/create-component'
import { borderMixin, flexMixin, roundedMixin, spacingMixin } from '@dooksa/components/mixins'

export const tabContent = createComponent({
  id: 'tab-content',
  tag: 'div',
  properties: [
    {
      name: 'className',
      value: 'tab-content'
    }
  ]
}, [flexMixin, borderMixin, roundedMixin, spacingMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('@dooksa/component-mixins/src/styles/flex.js').FlexMixin} FlexMixin
 * @typedef {import('@dooksa/component-mixins/src/styles/border.js').BorderMixin} BorderMixin
 * @typedef {import('@dooksa/component-mixins/src/styles/rounded.js').RoundedMixin} RoundedMixin
 * @typedef {import('@dooksa/component-mixins/src/styles/spacing.js').SpacingMixin} SpacingMixin
 */

/**
 * @typedef {Object} ComponentExtendTabContentOption
 * @property {BorderMixin|FlexMixin|RoundedMixin|SpacingMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendTabContentOption} options
 */
export const createTabContent = function (options) {
  return extendComponent(tabContent, options)
}

