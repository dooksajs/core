import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'eventTypeFocus'
  },
  data: {
    eventTypes: {
      blur: true,
      focus: true,
      focusin: true,
      focusout: true
    }
  }
})

