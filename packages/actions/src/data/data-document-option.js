import createAction from '@dooksa/create-action'

export const dataDocumentOption = createAction('data-document-option', [
  {
    list_map: {
      actionId: 'data-document-option-item',
      items: {
        action_getBlockValue: {
          value: {
            data_getValue: {
              name: {
                variable_getValue: {
                  scope: { action_getContextValue: 'groupId' },
                  query: 'data-document-collection'
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
