import createAction from '@dooksa/create-action'

export default createAction('data-document-root-id', [
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'data-document-root-id',
          value: { action_getContextValue: 'id' }
        }
      ]
    }
  }
])
