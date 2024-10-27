import createAction from '@dooksa/create-action'

export default createAction('data-collection-label', [
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'action-card-body-label-icon',
          value: 'mdi:file-document-multiple'
        },
        {
          id: 'action-card-body-label-text',
          value: 'Collection'
        }
      ]
    }
  }
])
