import createAction from '@dooksa/create-action'

export default createAction('variable-context-root-id', [
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'variable_context_root_id',
          value: { action_getContextValue: 'rootId' }
        }
      ]
    }
  }
])
