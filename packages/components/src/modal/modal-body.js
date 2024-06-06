import { createComponent, extendComponent } from '@dooksa/create-component'
import { displayMixin, flexMixin, gapMixin, spacingMixin } from '../mixins/index.js'

const modalBody = createComponent({
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
 * @typedef {import('../mixins/display.js').DisplayMixin} DisplayMixin
 * @typedef {import('../mixins/spacing.js').SpacingMixin} SpacingMixin
 * @typedef {import('../mixins/gap.js').GapMixin} GapMixin
 * @typedef {import('../mixins/flex.js').FlexMixin} FlexMixin
 */

/**
 * @typedef {Object} ExtendModalBody
 * @property {DisplayMixin|SpacingMixin|GapMixin|FlexMixin} options
 */

/**
 * @param {ComponentExtend|ExtendModalBody} options
 */
function extendModalBody (options) {
  return extendComponent(modalBody, options)
}

export {
  modalBody,
  extendModalBody
}

export default modalBody



