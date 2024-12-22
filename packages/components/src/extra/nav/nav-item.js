import { createComponent, extendComponent } from '@dooksa/create-component'
import { flexMixin } from '@dooksa/components/mixins'

export const navItem = createComponent({
  id: 'nav-item',
  tag: 'li',
  properties: [
    {
      name: 'className',
      value: 'nav-item'
    }
  ],
  options: {
    rolePresentation: {
      name: 'role',
      value: 'presentation'
    }
  }
}, [flexMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {FlexMixin} from '#mixins'
 */

/**
 * @typedef {Object} ComponentExtendNavItem
 * @property {boolean} [rolePresentation] - Indicates if component is expanded
 */

/**
 * @typedef {Object} ComponentExtendNavItemOption
 * @property {ComponentExtendNavItem | FlexMixin} [options]
 */

/**
 * @param {ComponentExtend & ComponentExtendNavItemOption} options
 */
export const createNavItem = function (options) {
  return extendComponent(navItem, options)
}
