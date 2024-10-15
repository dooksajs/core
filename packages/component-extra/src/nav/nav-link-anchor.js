import { createComponent, extendComponent } from '@dooksa/create-component'
import { createText } from '@dooksa/component-base'
import { ariaCurrentMixin, ariaSelectedMixin } from '@dooksa/component-mixins'

const navLinkText = createText({
  options: {
    text: 'Link'
  }
})

export const navLinkAnchor = createComponent({
  id: 'nav-link',
  tag: 'a',
  children: [navLinkText],
  content: [
    {
      name: 'href',
      nodePropertyName: 'value'
    }
  ],
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
    },
    href: {
      name: 'href'
    }
  }
}, [ariaCurrentMixin, ariaSelectedMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('@dooksa/component-mixins/src/styles/flex.js').FlexMixin} FlexMixin
 * @typedef {import('@dooksa/component-mixins/src/aria/aria-current.js').AriaCurrentMixin} AriaCurrentMixin
 * @typedef {import('@dooksa/component-mixins/src/aria/aria-selected.js').AriaSelectedMixin} AriaSelectedMixin
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
export const createNavLinkAnchor = function (options) {
  return extendComponent(navLinkAnchor, options)
}
