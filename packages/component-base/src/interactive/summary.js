import { createComponent, extendComponent } from '@dooksa/create-component'

export const summary = createComponent({
  id: 'summary',
  tag: 'summary',
})

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {ComponentExtend} ExtendSummary
 */

/**
 * @param {ExtendSummary} options
 */
export const extendSummary = function (options) {
  return extendComponent(summary, options)
}
