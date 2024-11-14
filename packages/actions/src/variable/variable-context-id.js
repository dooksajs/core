import createAction from '@dooksa/create-action'

export default createAction('variable-context-id', [
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'variable_context_id',
          value: { action_getContextValue: 'id' }
        }
      ]
    }
  }
])
