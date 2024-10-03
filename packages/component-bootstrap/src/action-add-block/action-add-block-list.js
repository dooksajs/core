import { extendListGroupAction } from '@dooksa/component-extra'

export default extendListGroupAction({
  options: { flush: true },
  events: [
    {
      on: 'component/created',
      actionId: 'action-add-block-fetch-actions'
    }
  ]
})
