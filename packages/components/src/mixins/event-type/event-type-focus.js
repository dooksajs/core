import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'event-type-focus'
  },
  data: {
    eventTypes: {
      'node/blur': true,
      'node/focus': true,
      'node/focusin': true,
      'node/focusout': true
    }
  }
})

