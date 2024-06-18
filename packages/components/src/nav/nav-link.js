import { createComponent, extendComponent } from '@dooksa/create-component'
import { extendText, text } from '../text/text.js'
import icon from '../icon/icon.js'
import { ariaCurrent, ariaSelected } from '../mixins/index.js'

const navLinkText = extendText({
  options: {
    text: 'Link'
  }
})

const navLink = createComponent({
  id: 'nav-link',
  tag: 'a',
  children: [navLinkText],
  allowedChildren: [text, icon],
  content: [
    {
      name: 'href',
      propertyName: 'value'
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
}, [ariaCurrent, ariaSelected])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/flex.js').FlexMixin} FlexMixin
 * @typedef {import('../mixins/aria/aria-current.js').AriaCurrentMixin} AriaCurrentMixin
 * @typedef {import('../mixins/aria/aria-selected.js').AriaSelectedMixin} AriaSelectedMixin
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
function extendNavLink (options) {
  return extendComponent(navLink, options)
}

export {
  extendNavLink,
  navLink
}

export default navLink

