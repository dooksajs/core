import createAction from '@dooksa/create-action'

export default createAction('action-input-value', [
  {
    $id: 'value',
    variable_getValue: {
      query: 'action-input-value'
    }
  },
  {
    action_ifElse: {
      if: [
        {
          left: { $ref: 'value' },
          op: '!!'
        }
      ],
      then: [{ $sequenceRef: 'update_component_option' }],
      else: []
    }
  },
  {
    $id: 'update_component_option',
    state_setValue: {
      name: 'component/options',
      value: {
        value: { $ref: 'value' }
      },
      options: {
        id: { action_getContextValue: 'id' },
        merge: true
      }
    }
  }
])
