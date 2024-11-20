import { createComponent, extendComponent } from '@dooksa/create-component'
import { createText } from '@dooksa/components/base'
import { ariaCurrentMixin, ariaSelectedMixin } from '@dooksa/components/mixins'

const navLinkText = createText({
  options: {
    value: 'Link'
  }
})

export const navLinkButton = createComponent({
  id: 'nav-link-button',
  tag: 'button',
  children: [navLinkText],
  properties: [
    {
      name: 'className',
      value: 'nav-link'
    }
  ],
  options: {
    tab: {
      name: 'role',
      value: 'tab'
    },
    ariaControls: {
      name: 'aria-controls'
    },
    active: {
      name: 'className',
      value: 'active',
      toggle: true
    }
  }
}, [ariaCurrentMixin, ariaSelectedMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../../mixins/styles/flex.js').FlexMixin} FlexMixin
 * @typedef {import('../../mixins/aria/aria-current.js').AriaCurrentMixin} AriaCurrentMixin
 * @typedef {import('../../mixins/aria/aria-selected.js').AriaSelectedMixin} AriaSelectedMixin
 */

/**
 * @typedef {Object} ComponentExtendNavLink
 * @property {Object} options
 * @property {string} [options.ariaControls] - The component which this button controls
 * @property {boolean} [options.tab] - Indicates if component is a tab
 * @property {boolean} [options.active] - Indicates if component an active tab
 */

/**
 * @typedef {Object} ComponentExtendNavLinkOption
 * @property {ComponentExtendNavLink|FlexMixin|AriaCurrentMixin|AriaSelectedMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendNavLinkOption} options
 */
export const createNavLinkButton = function (options) {
  return extendComponent(navLinkButton, options)
}
