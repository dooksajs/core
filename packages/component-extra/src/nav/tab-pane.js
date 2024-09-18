import { createComponent, extendComponent } from '@dooksa/create-component'
import { flexMixin, idMixin } from '@dooksa/component-mixins'

export const tabPane = createComponent({
  id: 'tab-pane',
  tag: 'div',
  properties: [
    {
      name: 'className',
      value: 'tab-pane'
    },
    {
      name: 'tabindex',
      value: '0'
    },
    {
      name: 'role',
      value: 'tabpanel'
    }
  ],
  options: {
    tabIndex: {
      name: 'tabindex',
      values: {
        on: '0',
        off: '-1'
      }
    },
    active: {
      name: 'className',
      value: 'active',
      toggle: true
    }
  }
}, [idMixin, flexMixin])

/**
 * @import {FlexMixin, IdMixin} from '@dooksa/component-mixins'
 * @import {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ComponentExtendTabPane
 * @property {string} [id]
 * @property {boolean} [active]
 * @property {'on'|'off'} [tabIndex]
 */

/**
 * @typedef {Object} ComponentExtendTabPaneOption
 * @property {ComponentExtendTabPane|FlexMixin|IdMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendTabPaneOption} options
 */
export const extendTabPane = function (options) {
  return extendComponent(tabPane, options)
}
