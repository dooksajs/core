import { createComponent, extendComponent } from '@dooksa/create-component'
import { flexMixin } from '../mixins/index.js'

const nav = createComponent({
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
    tabRole: {
      name: 'role',
      value: 'tablist'
    },
    underline: {
      name: 'className',
      value: 'nav-underline'
    }
  }
}, [flexMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/flex.js').FlexMixin} FlexMixin
 */

/**
 * @typedef {Object} ComponentExtendNav
 * @property {Object} options
 * @property {'tab'|'pill'} [options.tabs] - The component which this button controls
 * @property {boolean} [options.tabRole] - Indicates if component is expanded
 */

/**
 * @typedef {Object} ComponentExtendNavOption
 * @property {ComponentExtendNav|FlexMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendNavOption} options
 */
function extendNav (options) {
  return extendComponent(nav, options)
}

export {
  extendNav,
  nav
}

export default nav
