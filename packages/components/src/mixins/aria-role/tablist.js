import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} RoleTablistMixin
 * @property {boolean} [roleTablist] - {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tablist_role}
 */

export default createMixin({
  metadata: {
    id: 'role-tablist'
  },
  data: {
    options: {
      roleTablist: {
        name: 'role',
        value: 'tablist'
      }
    }
  }
})

