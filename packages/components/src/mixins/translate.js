import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'translate'
  },
  data: {
    options: {
      translate: {
        name: 'className',
        values: {
          middle: 'translate-middle',
          bottom: 'translate-middle-x',
          top: 'translate-middle-y'
        }
      }
    },
    styles: [
      {
        name: 'translate',
        type: 'units'
      }
    ]
  }
})
