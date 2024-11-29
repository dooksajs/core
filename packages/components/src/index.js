import base from './base/index.js'
import extra from './extra/index.js'
import bootstrap from './bootstrap/index.js'

/**
 * @type {import('@dooksa/create-component').Component[]} List of component IDs
 */
export const components = []
  .concat(base)
  .concat(extra)
  .concat(bootstrap)

export {
  base,
  extra,
  bootstrap
}
