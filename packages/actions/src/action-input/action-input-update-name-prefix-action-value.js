import createAction from '@dooksa/create-action'

export default createAction('action-input-update-name-prefix-action-value', [
  {
    $id: 'root_id',
    variable_getValue: {
      query: 'action-input-root-id'
    }
  },
  {
    action_ifElse: {
      if: [
        {
          left: { $ref: 'root_id' },
          op: '!!'
        }
      ],
      then: [
        { $sequenceRef: 'update_action_prefix_name' }
      ],
      else: []
    }
  },
  {
    $id: 'update_action_prefix_name',
    state_addListener: {
      name: 'variable/values',
      id: { $ref: 'root_id' },
      handler: 'action-input-name-prefix-action-value'
    }
  }
])
