import { extendText, extendOption } from '@dooksa/component-base'

const text = extendText({
  events: [
    {
      on: 'component/mount',
      actionId: 'action-param-collection-option-text'
    }
  ]
})

export default extendOption({
  metadata: {
    id: 'action-param-collection-option'
  },
  children: [text]
})
