import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'position'
  },
  data: {
    options: {
      position: {
        name: 'className',
        values: {
          relative: 'position-relative',
          static: 'position-static',
          absolute: 'position-absolute',
          sticky: 'position-sticky',
          fixed: 'position-fixed'
        }
      }
    }
  }
})
