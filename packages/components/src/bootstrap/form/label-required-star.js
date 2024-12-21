import { createSpan, createText } from '#base'

export default createSpan({
  metadata: {
    id: 'label-required-star'
  },
  children: [
    createText({
      options: {
        value: ' *'
      }
    })
  ],
  options: { textColor: 'danger' }
})
