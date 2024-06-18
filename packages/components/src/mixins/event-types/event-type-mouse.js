import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'eventTypeMouse'
  },
  data: {
    eventTypes: {
      auxclick: true,
      click: true,
      contextmenu: true,
      dblclick: true,
      mousedown: true,
      mouseenter: true,
      mouseleave: true,
      mousemove: true,
      mouseover: true,
      mouseup: true
    }
  }
})

