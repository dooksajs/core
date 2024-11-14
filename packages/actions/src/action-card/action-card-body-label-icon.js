import createAction from '@dooksa/create-action'

export const actionCardBodyLabelIcon = createAction('action-card-body-label-icon', [
  {
    data_setValue: {
      name: 'component/options',
      value: {
        icon: {
          variable_getValue: {
            scope: { action_getContextValue: 'groupId' },
            query: 'action_card_body_label_icon'
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
