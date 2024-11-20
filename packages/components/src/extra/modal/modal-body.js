import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  displayMixin, flexMixin, gapMixin, spacingMixin
} from '@dooksa/components/mixins'

export const modalBody = createComponent({
  id: 'modal-body',
  tag: 'div',
  allowedChildren: [],
  properties: [
    {
      name: 'className',
      value: 'modal-body'
    }
  ]
}, [displayMixin, flexMixin, spacingMixin, gapMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../../mixins/styles/display.js').DisplayMixin} DisplayMixin
 * @typedef {import('../../mixins/styles/spacing.js').SpacingMixin} SpacingMixin
 * @typedef {import('../../mixins/styles/gap.js').GapMixin} GapMixin
 * @typedef {import('../../mixins/styles/flex.js').FlexMixin} FlexMixin
 */

/**
 * @typedef {Object} ExtendModalBody
 * @property {DisplayMixin|SpacingMixin|GapMixin|FlexMixin} options
 */

/**
 * @param {ComponentExtend|ExtendModalBody} options
 */
export const createModalBody = function (options) {
  return extendComponent(modalBody, options)
}
