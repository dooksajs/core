import createAction from '@dooksa/create-action'

export const actionCardBodyLabelText = createAction('action-card-body-label-text', [
  {
    data_setValue: {
      name: 'component/options',
      value: {
        value: {
          variable_getValue: {
            scope: { action_getContextValue: 'groupId' },
            query: 'action_card_body_label_text'
          }
        }
      },
      options: {
        id: { action_getContextValue: 'id' },
        merge: true
      }
    }
  }
])
