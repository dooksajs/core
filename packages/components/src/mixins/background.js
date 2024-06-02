import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'background'
  },
  data: {
    options: {
      background: {
        name: 'className',
        values: {
          primary: 'bg-primary',
          primarySubtle: 'bg-primary-subtle',
          secondary: 'bg-secondary',
          secondarySubtle: 'bg-secondary-subtle'
        }
      },
      gradient: {
        name: 'className',
        values: {
          primary: 'bg-primary bg-gradient'
        }
      }
    }
  }
})

