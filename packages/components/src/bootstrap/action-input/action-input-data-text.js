import {
  createInputText
} from '@dooksa/components/base'

export default createInputText({
  metadata: { id: 'action-input-data-text' },
  events: [
    {
      on: 'component/created',
      actionId: 'action-input-name-prefix-action-value'
    },
    {
      on: 'component/created',
      actionId: 'action-input-value'
    },
    {
      on: 'component/created',
      actionId: 'input-id'
    }
  ]
})
