import createAction from '@dooksa/create-action'

export default createAction('action-input-name-prefix-action-value', [
  {
    $id: 'input_name',
    variable_getValue: {
      query: 'action-input-name'
    }
  },
  {
    $id: 'new_input_name',
    operator_eval: {
      name: '+',
      values: [
        '[',
        { action_getContextValue: 'groupId' },
        ']',
        { $ref: 'input_name' }
      ]
    }
  },
  {
    state_setValue: {
      name: 'component/options',
      value: {
        name: { $ref: 'new_input_name' }
      },
      options: {
        id: { action_getContextValue: 'id' },
        merge: true
      }
    }
  }
])
