import createAction from '@dooksa/create-action'

export default createAction('data-document-label', [
  {
    action_setActionValue: {
      id: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'action-card-body-label-icon',
          value: 'mdi:file-document'
        },
        {
          id: 'action-card-body-label-text',
          value: 'Document ID'
        }
      ]
    }
  }
])
