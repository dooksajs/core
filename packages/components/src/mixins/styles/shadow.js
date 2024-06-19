import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} ShadowMixin
 * @property {'none'|'sm'|'md'|'lg'} [shadow]
 */


export default createMixin({
  metadata: {
    id: 'shadow'
  },
  data: {
    options: {
      shadow: {
        name: 'className',
        values: {
          none: 'shadow-none',
          sm: 'shadow-sm',
          md: 'shadow',
          lg: 'shadow-lg'
        }
      }
    }
  }
})
