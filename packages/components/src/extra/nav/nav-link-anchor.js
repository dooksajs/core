import { createComponent, extendComponent } from '@dooksa/create-component'
import { createText } from '@dooksa/components/base'
import { ariaCurrentMixin, ariaSelectedMixin } from '@dooksa/components/mixins'

const navLinkText = createText({
  options: {
    value: 'Link'
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
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {FlexMixin, AriaCurrentMixin, AriaSelectedMixin} from '#mixins'
 */

/**
 * @typedef {Object} ComponentExtendNavLink
 * @property {string} [ariaControls] - The component which this button controls
 * @property {boolean} [tab] - Indicates if component is a tab
 * @property {boolean} [active] - Indicates if component an active tab
 */

/**
 * @typedef {Object} ComponentExtendNavLinkOption
 * @property {ComponentExtendNavLink | FlexMixin | AriaCurrentMixin | AriaSelectedMixin} [options]
 */

/**
 * @param {ComponentExtend & ComponentExtendNavLinkOption} options
 */
export const createNavLinkAnchor = function (options) {
  return extendComponent(navLinkAnchor, options)
}
