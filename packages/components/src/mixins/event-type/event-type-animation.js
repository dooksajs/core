import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'even-type-animation'
  },
  data: {
    eventTypes: {
      'node/animationcancel': true,
      'node/animationend': true,
      'node/animationiteration': true,
      'node/animationstart': true
    }
  }
})

