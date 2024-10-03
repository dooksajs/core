import createAction from '@dooksa/create-action'

export default createAction('data-document-option', [
  {
    list_map: {
      actionId: 'data-document-option-item',
      items: {
        action_getBlockValue: {
          value: {
            data_getValue: {
              name: {
                action_getActionValue: {
                  id: { action_getContextValue: 'groupId' },
                  query: 'data-document-select-id'
                }
              }
            }
          },
          query: 'item'
        }
      }
    }
  }
])
