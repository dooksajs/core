/**
 * @typedef {import('@dooksa/create-component').BreakpointAlwaysXXL} BreakpointAlwaysXXL
 */

/**
 * @typedef {Object} ExtendListGroupOptions
 * @property {boolean} [active]
 * @property {boolean} [disabled]
 * @property {import('@dooksa/create-component').Color} [variants]
 */

export default {
  active: {
    name: 'className',
    value: 'active'
  },
  variants: {
    name: 'className',
    values: {
      primary: 'list-group-item-primary',
      secondary: 'list-group-item-secondary',
      success: 'list-group-item-success',
      danger: 'list-group-item-danger',
      warning: 'list-group-item-warning',
      info: 'list-group-item-info',
      light: 'list-group-item-light',
      dark: 'list-group-item-dark'
    }
  }
}
