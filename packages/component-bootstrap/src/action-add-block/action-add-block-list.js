import { createListGroupAction } from '@dooksa/component-extra'

export default createListGroupAction({
  options: { flush: true },
  events: [
    {
      on: 'component/created',
      actionId: 'action-add-block-fetch-actions'
    }
  ]
})
