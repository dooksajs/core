import {
  createSelect
} from '@dooksa/components/base'

export default createSelect({
  metadata: { id: 'action-input-data-action' },
  options: {
    name: '.$ref'
  },
  events: [
    {
      on: 'component/created',
      actionId: 'action-input-name-prefix-action-value'
    },
    {
      on: 'component/created',
      actionId: 'input-id'
    },
    {
      on: 'component/created',
      actionId: 'action-input-data-action-options'
    }
  ]
})
