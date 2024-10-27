import createAction from '@dooksa/create-action'

export default createAction('data-document-select-method-label', [
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'action-card-body-label-icon',
          value: 'mdi:arrange-bring-forward'
        },
        {
          id: 'action-card-body-label-text',
          value: 'Select document ID By'
        }
      ]
    }
  }
])
