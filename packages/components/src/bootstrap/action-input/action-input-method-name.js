import { createInputHidden } from '#base'

export default createInputHidden({
  metadata: {
    id: 'action-input-method-name'
  },
  options: {
    name: 'action-method'
  },
  events: [
    {
      on: 'component/created',
      actionId: 'action-input-name-prefix'
    },
    {
      on: 'component/created',
      actionId: 'action-input-value-action-method'
    }
  ]
})
