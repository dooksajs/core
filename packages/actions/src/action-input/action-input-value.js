import createAction from '@dooksa/create-action'

export const actionInputValue = createAction('action-input-value', [
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
          from: { $ref: 'value' },
          op: '!!'
        }
      ],
      then: [{ $sequenceRef: 'update_component_option' }],
      else: []
    }
  },
  {
    $id: 'update_component_option',
    data_setValue: {
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
