import { createListGroupAction } from '@dooksa/components/extra'

export default createListGroupAction({
  options: { flush: true },
  events: [
    {
      on: 'component/created',
      actionId: 'action-add-block-fetch-actions'
    }
  ]
})
