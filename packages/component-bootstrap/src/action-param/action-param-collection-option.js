import { extendText, extendSelectOption } from '@dooksa/component-base'

const text = extendText({
  events: [
    {
      on: 'component/mount',
      actionId: 'action-param-collection-option-text'
    }
  ]
})

export default extendSelectOption({
  metadata: {
    id: 'action-param-collection-option'
  },
  children: [text]
})
