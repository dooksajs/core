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
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {FlexMixin, BorderMixin, RoundedMixin, SpacingMixin} from '#mixins'
 */

/**
 * @typedef {Object} ComponentExtendTabContentOption
 * @property {BorderMixin | FlexMixin | RoundedMixin | SpacingMixin} [options]
 */

/**
 * @param {ComponentExtend & ComponentExtendTabContentOption} options
 */
export const createTabContent = function (options) {
  return extendComponent(tabContent, options)
}

