import createAction from '@dooksa/create-action'

export const dataCollectionLabel = createAction('data-collection-label', [
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'action_card_body_label_icon',
          value: 'mdi:file-document-multiple'
        },
        {
          id: 'action_card_body_label_text',
          value: 'Collection'
        }
      ]
    }
  }
])
