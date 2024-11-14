import createAction from '@dooksa/create-action'

export default createAction('variable-context-parent-id', [
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'variable_context_parent_id',
          value: { action_getContextValue: 'parentId' }
        }
      ]
    }
  }
])
