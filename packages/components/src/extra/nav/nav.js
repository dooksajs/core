import { createComponent, extendComponent } from '@dooksa/create-component'
import { flexMixin, roleTablistMixin } from '@dooksa/components/mixins'

export const nav = createComponent({
  id: 'ul',
  tag: 'nav',
  properties: [
    {
      name: 'className',
      value: 'nav'
    }
  ],
  options: {
    tabs: {
      name: 'className',
      values: {
        tab: 'nav-tabs',
        pill: 'nav-pills'
      }
    },
    underline: {
      name: 'className',
      value: 'nav-underline'
    }
  }
}, [flexMixin, roleTablistMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {FlexMixin, RoleTablistMixin} from '#mixins'
 */

/**
 * @typedef {Object} ComponentExtendNav
 * @property {'tab'|'pill'} [tabs] - The component which this button controls
 */

/**
 * @typedef {Object} ComponentExtendNavOption
 * @property {ComponentExtendNav | FlexMixin | RoleTablistMixin} [options]
 */

/**
 * @param {ComponentExtend & ComponentExtendNavOption} options
 */
export const createNav = function (options) {
  return extendComponent(nav, options)
}
