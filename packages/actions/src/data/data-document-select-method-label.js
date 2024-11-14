import createAction from '@dooksa/create-action'

export const dataDocumentSelectMethodLabel = createAction('data-document-select-method-label', [
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'action_card_body_label_icon',
          value: 'mdi:arrange-bring-forward'
        },
        {
          id: 'action_card_body_label_text',
          value: 'Select document ID By'
        }
      ]
    }
  }
])
